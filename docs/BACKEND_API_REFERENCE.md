## 1. Overview

The backend for CIT Takshashila 2026 is implemented as **Next.js 16 App Router API routes** under `app/api/**`, deployed as serverless functions on **Vercel**.

API routes act as a **Backend‑for‑Frontend (BFF)** and are the only components allowed to:

- Use the **Firebase Admin SDK** (Auth + Firestore)
- Call **Cashfree** (payments)
- Call **Resend** (emails)

All endpoints return JSON responses and are designed to be called from the Next.js frontend and from trusted third parties (e.g. Cashfree webhooks).

---

## 2. Authentication & Common Concerns

### 2.1 Authentication Mechanism

- User authentication relies on **Firebase Authentication** (Google sign‑in).
- Frontend obtains a Firebase **ID token** and passes it in:

```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

- Protected API routes:
  - Verify the token using Firebase Admin (`verifyIdToken`).
  - Use `uid` from the decoded token as the authenticated user ID.
  - Enforce ownership and role conditions (e.g. organizer checks).

Details of the auth flow are in `AUTHENTICATION_AUTHORIZATION.md`.

### 2.2 Rate Limiting

Several endpoints use an in‑memory rate limiter (`src/lib/security/rateLimiter.ts`):

- `/api/payment/create-order` – 5 requests per minute per IP
- `/api/passes/scan` – 10 requests per minute per IP
- `/api/passes/scan-member` – 20 requests per minute per IP
- `/api/users/profile` (POST) – 5 requests per minute per IP

On violation, they return:

- HTTP `429 Too Many Requests`
- JSON `{ error: "Too many requests. Please try again later." }` (message may vary)

### 2.3 Error Handling

Common error pattern:

```ts
try {
  // ...
} catch (error: unknown) {
  console.error('Context message', error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Internal server error' },
    { status: 500 },
  );
}
```

Status codes used:

- `400` – invalid input, bad request
- `401` – unauthenticated
- `403` – forbidden (ownership/role failure)
- `404` – not found (payment, pass, team, member)
- `409` – conflict (e.g. pass already used)
- `429` – rate‑limit exceeded
- `500` – unexpected server error

---

## 3. Payments API

### 3.1 `POST /api/payment/create-order`

**Purpose:** Create a Cashfree payment order and initialize Firestore `payments` (and optionally `teams`) documents.

- **Auth:** Required (Bearer Firebase ID token)
- **Rate limit:** 5 requests/minute/IP

#### Request

```json
{
  "passType": "day_pass | group_events | proshow | sana_concert",
  "amount": 500,
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "college": "CIT"
  },
  "selectedDays": ["DAY_1", "DAY_2"],      // optional, for day_pass
  "teamData": {                            // optional, for group_events
    "teamName": "Alpha Team",
    "members": [
      {
        "memberId": "m1",
        "name": "Leader Name",
        "email": "leader@example.com",
        "phone": "9876543210",
        "isLeader": true
      }
      // ...
    ]
  }
}
```

Key behaviors:

- Validates `passType` against configured `PASS_TYPES`.
- Validates `amount` against pricing rules:
  - `day_pass` → ₹500 flat
  - `group_events` → ₹250 × number of team members
  - `proshow` → ₹1500 flat
  - `sana_concert` → ₹2000 flat
- Validates phone and name formats.
- Creates a `payments/{orderId}` document with status `pending`.
- For `group_events`:
  - Creates or updates a `teams/{teamId}` document containing leader and members.
- Calls Cashfree PG API with appropriate environment (sandbox/production).

#### Response

```json
{
  "success": true,
  "orderId": "order_1712345678_ABC",
  "paymentSessionId": "session_12345",
  "env": "sandbox"
}
```

On error:

- `400` – invalid payload, invalid pass type, mismatched `amount`.
- `401` – missing/invalid Bearer token.
- `429` – rate limit exceeded.
- `500` – Cashfree/network/Firestore errors.

---

### 3.2 `POST /api/payment/verify`

**Purpose:** Verify a Cashfree payment status and ensure a pass is created for a given `orderId`. Used by the frontend after redirect / modal close.

- **Auth:** None (orderId‑based, but validates against server‑side records)
- **Rate limit:** Not explicitly enforced (still protected by payload)

#### Request

```json
{
  "orderId": "order_1712345678_ABC"
}
```

#### Behavior

1. Looks up `payments/{orderId}` in Firestore.
2. If payment is not found:
   - Returns `404` with `{ error: "Payment not found" }`.
3. If status is already `success`:
   - Checks if a `passes` document exists for this `paymentId`.
   - If found, returns it directly (idempotent behavior).
4. If status is `pending`:
   - Calls Cashfree orders API to fetch the current status.
   - If **paid/successful**, updates `payments.status` to `success` and:
     - Creates a `passes` document with:
       - `userId`, `passType`, `amount`, `paymentId`
       - `qrCode` (signed payload)
       - `teamSnapshot` for group events
     - Optionally uses PDF generator + Resend to send confirmation.
   - If not paid, returns a suitable message.
5. Uses small retry logic (3 attempts with short delay) when waiting for Firestore updates after webhook.

#### Response (success)

```json
{
  "success": true,
  "payment": {
    "orderId": "order_1712345678_ABC",
    "status": "success"
  },
  "pass": {
    "id": "pass_abc123",
    "userId": "uid123",
    "passType": "day_pass",
    "amount": 500,
    "status": "paid",
    "qrCode": "data:image/png;base64,...",
    "createdAt": "2026-02-11T10:00:00.000Z"
  }
}
```

On error:

- `400` – missing/invalid `orderId`.
- `404` – payment not found.
- `500` – Cashfree or Firestore errors.

---

## 4. Passes API

### 4.1 `GET /api/passes/[passId]`

**Purpose:** Fetch details for a specific pass.

- **Auth:** Required (Bearer Firebase ID token)
- **Authorization:**
  - Requesting user must either:
    - Own the pass (`pass.userId === uid`), or
    - Be an organizer (`users/{uid}.isOrganizer === true`).

#### Request

Path parameter:

- `passId` – Firestore document ID from `passes` collection.

Headers:

- `Authorization: Bearer <FIREBASE_ID_TOKEN>`

#### Response

```json
{
  "id": "pass_abc123",
  "userId": "uid123",
  "passType": "day_pass",
  "amount": 500,
  "paymentId": "order_1712345678_ABC",
  "status": "paid",
  "qrCode": "data:image/png;base64,...",
  "createdAt": "2026-02-11T10:00:00.000Z",
  "usedAt": null,
  "scannedBy": null,
  "teamId": null,
  "teamSnapshot": null
}
```

Error codes:

- `401` – missing/invalid token.
- `403` – user neither owner nor organizer.
- `404` – pass not found.

---

### 4.2 `GET /api/passes/types`

**Purpose:** List available pass types and their pricing for the frontend.

- **Auth:** None

#### Response

```json
{
  "passes": [
    {
      "id": "day-pass",
      "passType": "day_pass",
      "amount": 500,
      "emoji": "🎟️",
      "title": "DAY PASS",
      "price": "₹500",
      "details": "Single day access to events and campus activities.",
      "meta": [
        "Ideal for individual participants",
        "Valid for any one day"
      ]
    },
    // other pass configs ...
  ]
}
```

Backed by `REGISTRATION_PASSES` in `src/data/passes.ts`.

---

### 4.3 `GET /api/passes/qr`

**Purpose:** Generate QR code image for a pass ID (primarily for internal/testing usage).

- **Auth:** None (uses only server‑side secret + pass data)

#### Query Parameters

- `passId` – ID of the pass.

#### Behavior

- Fetches pass by ID.
- Generates signed QR payload using `QR_SECRET_KEY`.
- Returns either:
  - PNG image (`image/png`) response, or
  - JSON with `qrCode` Data URL (depending on the concrete implementation).

#### Notes

Because the QR payload itself is signed and time‑limited, the endpoint does not require user auth but should not be exposed in public UIs as an open proxy.

---

### 4.4 `POST /api/passes/qr`

**Purpose:** Test helper endpoint to generate a QR code for arbitrary data (not used in main flow).

- **Auth:** None

#### Request

```json
{
  "passId": "pass_abc123",
  "userId": "uid123",
  "passType": "day_pass"
}
```

#### Response

```json
{
  "qrCode": "data:image/png;base64,..."
}
```

Useful for internal testing and QR visualization.

---

### 4.5 `POST /api/passes/scan`

**Purpose:** Validate a scanned QR code and mark a pass as used. Used by organizers at entry gates.

- **Auth:** Required (Bearer Firebase ID token)
- **Role:** Organizer only (`isOrganizer === true`)
- **Rate limit:** 10 requests/minute/IP

#### Request

```json
{
  "qrData": "passId:expiry.signature"     // signed token string embedded in QR
}
```

#### Behavior

1. Verifies Bearer token and checks `isOrganizer`.
2. Validates QR token using `verifySignedQR`:
   - Checks HMAC signature with `QR_SECRET_KEY`.
   - Checks expiry time.
3. Loads corresponding `passes/{passId}` document.
4. If already used:
   - Returns `409` with `{ error: "Pass already used" }`.
5. Otherwise:
   - Updates pass:
     - `status = "used"`
     - `usedAt = now`
     - `scannedBy = organizerUid`
   - Returns updated pass data.

#### Response

```json
{
  "success": true,
  "pass": {
    "id": "pass_abc123",
    "userId": "uid123",
    "passType": "day_pass",
    "status": "used",
    "usedAt": "2026-02-11T10:30:00.000Z",
    "scannedBy": "organizerUid456"
  }
}
```

Error codes:

- `401` – unauthenticated.
- `403` – not an organizer.
- `400` – missing/invalid QR token.
- `404` – pass not found.
- `409` – pass already used.
- `429` – too many scans from same IP.

---

### 4.6 `POST /api/passes/scan-member`

**Purpose:** Check in a single team member for group events.

- **Auth:** Required (Bearer Firebase ID token)
- **Role:** Organizer only
- **Rate limit:** 20 requests/minute/IP

#### Request

```json
{
  "teamId": "team_abc123",
  "memberId": "m1"
}
```

#### Behavior

1. Verifies Bearer token and organizer status.
2. Loads `teams/{teamId}`.
3. Finds member with `memberId`.
4. If already checked in:
   - Returns `409` with `{ error: "Member already checked in" }`.
5. Otherwise:
   - Updates member’s attendance:
     - `checkedIn = true`
     - `checkInTime = now`
     - `checkedInBy = organizerUid`
   - Saves updated `teams/{teamId}`.

#### Response

```json
{
  "success": true,
  "team": {
    "teamId": "team_abc123",
    "members": [
      {
        "memberId": "m1",
        "attendance": {
          "checkedIn": true,
          "checkInTime": "2026-02-11T10:35:00.000Z",
          "checkedInBy": "organizerUid456"
        }
      }
    ]
  }
}
```

Error codes:

- `401`, `403`, `404`, `409`, `500` as appropriate.

---

## 5. Users API

### 5.1 `GET /api/users/profile`

**Purpose:** Fetch the authenticated user’s profile document (`users/{uid}`).

- **Auth:** Required (Bearer Firebase ID token)

#### Request

Headers:

```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

#### Response

```json
{
  "uid": "uid123",
  "name": "John Doe",
  "email": "john@example.com",
  "college": "CIT",
  "phone": "9876543210",
  "isOrganizer": false,
  "createdAt": "2026-02-10T12:00:00.000Z"
}
```

If the profile does not exist yet, the API may return `null` or a `404`‑style payload depending on implementation; the frontend treats this as “profile incomplete”.

---

### 5.2 `POST /api/users/profile`

**Purpose:** Create or update the authenticated user’s profile in `users/{uid}`.

- **Auth:** Required (Bearer Firebase ID token)
- **Rate limit:** 5 requests/minute/IP

#### Request

```json
{
  "name": "John Doe",
  "college": "Chennai Institute of Technology",
  "phone": "9876543210"
}
```

Validation via Zod (`userProfileSchema` in `src/lib/security/validation.ts`):

- `name`: 2–50 characters, letters and spaces.
- `college`: 2–100 characters, sanitized for HTML/XSS.
- `phone`: 10 digits, starting with 6–9.

The server:

- Validates inputs and sanitizes strings (removes `<`, `>`, `javascript:`, inline event handlers).
- Writes/overwrites `users/{uid}` with:

```json
{
  "uid": "uid123",
  "name": "John Doe",
  "email": "john@example.com",
  "college": "Chennai Institute of Technology",
  "phone": "9876543210",
  "isOrganizer": false,          // enforced; cannot be set by client
  "createdAt": "<serverTimestamp>"
}
```

#### Response

```json
{
  "success": true
}
```

Error codes:

- `400` – invalid input.
- `401` – unauthenticated.
- `429` – rate limit exceeded.
- `500` – Firestore errors.

---

### 5.3 `GET /api/users/passes`

**Purpose:** List passes belonging to the authenticated user.

- **Auth:** Required (Bearer Firebase ID token)

#### Behavior

- Queries `passes` collection with:
  - `where('userId', '==', uid)`
  - Optionally `where('status', '==', 'paid')`
  - Ordered by `createdAt` descending.

#### Response

```json
{
  "passes": [
    {
      "id": "pass_abc123",
      "passType": "day_pass",
      "amount": 500,
      "status": "paid",
      "createdAt": "2026-02-11T10:00:00.000Z"
    },
    {
      "id": "pass_def456",
      "passType": "proshow",
      "amount": 1500,
      "status": "used",
      "createdAt": "2026-02-10T18:00:00.000Z"
    }
  ]
}
```

---

## 6. Webhooks & Admin

### 6.1 `POST /api/webhooks/cashfree`

**Purpose:** Handle Cashfree payment webhooks (e.g. `PAYMENT_SUCCESS_WEBHOOK`).

- **Auth:** None (secured via HMAC signature from Cashfree)

#### Request

Headers (examples):

```http
x-webhook-signature: <HMAC signature>
content-type: application/json
```

Body (simplified):

```json
{
  "type": "PAYMENT_SUCCESS_WEBHOOK",
  "data": {
    "order": {
      "order_id": "order_1712345678_ABC",
      "order_amount": 500
    },
    "payment": {
      "payment_status": "SUCCESS"
    }
  }
}
```

#### Behavior

1. Verifies webhook signature using Cashfree secret key and raw body.
2. If invalid, returns `401`.
3. If event type is not a success event, returns `{ ok: true }` without changes.
4. On success event:
   - Looks up `payments/{orderId}` in Firestore.
   - If not found, returns `{ ok: true }` (no 404, to avoid webhook retries).
   - If already `success`, returns `{ ok: true }`.
   - Updates payment to `status = 'success'`.
   - Creates pass (if one does not exist):
     - Generates signed QR payload + image.
     - For group events, fetches `teams/{teamId}` and snapshots members into `teamSnapshot`.
   - Sends confirmation email via Resend (with optional PDF).

#### Response

```json
{ "ok": true }
```

Error codes:

- `401` – invalid signature.
- `500` – unexpected server error (still tries to avoid repeated failures).

---

### 6.2 `POST /api/admin/fix-stuck-payment`

**Purpose:** Administrative endpoint to recover “stuck” payments (e.g. webhook not received, verify not called in time).

- **Auth:** **None** (intended for restricted, internal use only – protect at network level)

#### Request

```json
{
  "orderId": "order_1712345678_ABC"
}
```

#### Behavior

1. Fetches `payments/{orderId}` from Firestore.
2. Calls Cashfree orders API to retrieve current status.
3. If payment is confirmed as paid:
   - Updates `payments.status` to `success`.
   - If a pass does not exist yet:
     - Creates the pass and sends email (same as webhook/verify logic).
4. Returns the final payment and pass state.

#### Response

```json
{
  "success": true,
  "payment": { "...": "..." },
  "pass": { "...": "..." }
}
```

On errors, it returns detailed messages (useful for manual debugging).

---

## 7. Summary Table

| Endpoint                       | Method | Auth        | Rate Limit        | Purpose                                      |
|--------------------------------|--------|-------------|-------------------|----------------------------------------------|
| `/api/payment/create-order`    | POST   | Bearer      | 5/min/IP          | Create Cashfree order + `payments` (+ team) |
| `/api/payment/verify`          | POST   | None        | –                 | Verify payment and create pass               |
| `/api/webhooks/cashfree`       | POST   | HMAC header | –                 | Handle Cashfree payment webhooks             |
| `/api/users/profile`           | GET    | Bearer      | –                 | Get current user profile                     |
| `/api/users/profile`           | POST   | Bearer      | 5/min/IP          | Create/update profile                        |
| `/api/users/passes`            | GET    | Bearer      | –                 | List passes owned by the user                |
| `/api/passes/[passId]`         | GET    | Bearer      | –                 | Fetch specific pass (owner/organizer)        |
| `/api/passes/types`            | GET    | None        | –                 | List registration pass types                 |
| `/api/passes/qr`               | GET    | None        | –                 | Generate QR for passId (internal/testing)    |
| `/api/passes/qr`               | POST   | None        | –                 | Test QR generator with sample data           |
| `/api/passes/scan`             | POST   | Bearer/org  | 10/min/IP         | Scan QR and mark pass as used                |
| `/api/passes/scan-member`      | POST   | Bearer/org  | 20/min/IP         | Check in group event member                  |
| `/api/admin/fix-stuck-payment` | POST   | None        | –                 | Admin recovery for stuck payments            |

For database structures used by these endpoints, see `DATABASE_SCHEMA.md`. For security and auth details, see `AUTHENTICATION_AUTHORIZATION.md`.

