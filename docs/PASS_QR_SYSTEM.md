## 1. Overview

The **Pass & QR system** is responsible for:

- Representing purchased passes in Firestore
- Generating secure QR codes for entry
- Scanning and validating passes at the gate
- Handling group event teams and member attendance

It ties together:

- Firestore collections: `passes`, `teams`, `payments`
- QR signing utilities (`QR_SECRET_KEY`)
- Pass scanning APIs (`/api/passes/scan`, `/api/passes/scan-member`)
- Email and PDF generation

---

## 2. Data Model Recap

See `DATABASE_SCHEMA.md` for full tables; key fields:

### 2.1 Pass Document (`passes/{passId}`)

| Field        | Description                                  |
|-------------|----------------------------------------------|
| `userId`    | UID of pass owner                            |
| `passType`  | One of `day_pass`, `group_events`, `proshow`, `sana_concert` |
| `amount`    | Amount paid                                  |
| `paymentId` | Related `payments/{paymentId}` / Cashfree order ID |
| `status`    | `'paid'` \| `'used'`                         |
| `qrCode`    | Data URL for QR image                        |
| `createdAt` | Creation timestamp                           |
| `usedAt`    | Timestamp when scanned (if used)             |
| `scannedBy` | Organizer UID who scanned (if used)          |
| `teamId`    | Related `teams/{teamId}` (for group passes)  |
| `teamSnapshot` | Immutable snapshot of team at payment time |

### 2.2 Team & Snapshot

- `teams/{teamId}` holds **current** team state (leader, members, payment status).
- `passes/{passId}.teamSnapshot` holds an **immutable copy** of team composition used for the pass.

---

## 3. QR Payload & Token Format

### 3.1 Payload Structure

Internally, a pass QR encodes a **signed token** that includes:

- `passId` – ID of the pass document
- `userId` – owner UID
- `passType` – type of pass
- `teamId` – optional, for group events
- `ts` – timestamp (creation time)
- `exp` – expiry timestamp

Example (conceptual) payload:

```json
{
  "passId": "pass_abc123",
  "userId": "uid123",
  "passType": "day_pass",
  "teamId": null,
  "ts": 1739270400,
  "exp": 1739356800
}
```

### 3.2 Token Signing

- Environment variable `QR_SECRET_KEY` is used as an HMAC‑SHA256 secret.
- Token format (string):

```text
<passId>:<exp>.<signature>
```

Where:

- `<signature> = HMAC_SHA256( JSON.stringify(payload), QR_SECRET_KEY )`
- Encoded (e.g. hex or base64) for transport.

This ensures:

- QR data cannot be forged without the secret.
- Even if a QR image is exposed, only the fields in the signed payload are trusted.

### 3.3 Expiry

- `exp` is set when the pass and QR are created (e.g. event window + buffer).
- On scan, token is rejected if current time > `exp`.
- This mitigates **replay attacks** with stale QR codes.

---

## 4. QR Generation Flow

### 4.1 When QR is Generated

QR codes are generated on the server:

- During pass creation, triggered by:
  - Cashfree webhook (`/api/webhooks/cashfree`), or
  - Client‑initiated verify (`/api/payment/verify`), or
  - Admin recovery (`/api/admin/fix-stuck-payment`).

### 4.2 Process

1. Construct payload (`passId`, `userId`, `passType`, `teamId?`, `ts`, `exp`).
2. Generate signed token using `QR_SECRET_KEY`.
3. Render QR image:
   - Using the `qrcode`/`canvas` libraries in `src/features/passes/qrService.ts`.
   - Result is a PNG **Data URL** (`data:image/png;base64,...`).
4. Store token (implicitly inside QR) and QR image:
   - `passes/{passId}.qrCode = "<data-url>"`.

### 4.3 Example (Conceptual)

```ts
const payload = { passId, userId, passType, teamId, ts: now, exp };
const token = signQrPayload(payload, QR_SECRET_KEY); // returns "<passId>:<exp>.<signature>"
const qrCode = await generateQrImage(token);         // returns Data URL

await setDoc(passRef, { qrCode, /* ...other fields... */ });
```

---

## 5. Scanning & Validation

### 5.1 Organizer Scan Endpoint (`POST /api/passes/scan`)

**Input:**

```json
{
  "qrData": "<passId>:<exp>.<signature>"
}
```

**Requirements:**

- Authenticated Firebase user.
- `isOrganizer === true`.
- Rate limit: 10 requests/min/IP.

**Steps:**

1. Authenticate and confirm user is organizer (see `AUTHENTICATION_AUTHORIZATION.md`).
2. Validate QR token:
   - Parse token into `{ passId, exp, signature }`.
   - Recompute signature from payload using `QR_SECRET_KEY`.
   - Compare with provided `signature`.
   - Reject if:
     - Signature mismatch.
     - Current time > `exp`.
3. Fetch `passes/{passId}` from Firestore.
4. Enforce business rules:
   - If `status === 'used'`:
     - Return `409` with error “Pass already used”.
   - If pass not found:
     - Return `404`.
5. Update pass:
   - `status = 'used'`
   - `usedAt = now`
   - `scannedBy = organizerUid`
6. Return updated pass to frontend for display.

**Response (success):**

```json
{
  "success": true,
  "pass": {
    "id": "pass_abc123",
    "passType": "day_pass",
    "status": "used",
    "usedAt": "2026-02-11T10:30:00.000Z",
    "scannedBy": "organizerUid456"
  }
}
```

### 5.2 Team Member Check-In (`POST /api/passes/scan-member`)

**Input:**

```json
{
  "teamId": "team_abc123",
  "memberId": "m1"
}
```

**Requirements:**

- Organizer auth required.
- Rate limit: 20 requests/min/IP.

**Steps:**

1. Verify organizer.
2. Fetch `teams/{teamId}`.
3. Find member by `memberId` within `members[]`.
4. If `attendance.checkedIn === true`:
   - Return `409` (already checked in).
5. Otherwise:
   - Update member’s `attendance`:
     - `checkedIn = true`
     - `checkInTime = now`
     - `checkedInBy = organizerUid`
6. Persist updated team document.
7. Return updated team or member snippet.

This enables granular **per‑member attendance** for group events, independent of pass usage.

---

## 6. Pass Lifecycle

### 6.1 States

Passes follow a simple lifecycle:

1. **No pass**
   - Before payment is initiated.
2. **Pending payment**
   - `payments` document exists with `status = 'pending'`.
   - No pass document yet.
3. **Paid (active pass)**
   - `payments.status = 'success'`.
   - `passes` document created:
     - `status = 'paid'`.
4. **Used**
   - After successful scan:
     - `passes.status = 'used'`.
     - `usedAt` and `scannedBy` populated.

### 6.2 Idempotency Guarantees

To avoid duplicates:

- Before creating a pass, server checks if a pass already exists for `paymentId`.
- If one exists:
  - It is returned instead of creating a second pass.
- Both webhook and verify flows use this check.

### 6.3 Group Events & Teams

For `group_events`:

- `teams/{teamId}` is created or updated at **order creation** time.
- When payment succeeds:
  - A **single pass** is issued:
    - `passes/{passId}.teamId = teamId`.
    - `teamSnapshot` is embedded in pass.
  - The team document is updated with:
    - `passId`,
    - `paymentStatus = 'success'`.

This allows:

- Entry validation via the pass QR.
- Individual member attendance via `/api/passes/scan-member`.

---

## 7. PDF Pass Generation

While QR is the primary gate mechanism, the system also supports **PDF passes**:

- Generated on server using:
  - `jspdf`
  - `canvas` / `html2canvas`
- Content typically includes:
  - Attendee name.
  - College and phone.
  - Pass type and amount.
  - Embedded QR image.
  - Event branding and instructions.

### 7.1 Generation & Delivery

1. After pass creation:
   - A PDF buffer is generated from a templated layout.
2. Email sending (`sendEmail`) attaches the PDF:

```ts
attachments: [{
  filename: "Takshashila_Pass.pdf",
  content: pdfBuffer
}]
```

3. If PDF generation fails:
   - The system still sends a non‑PDF email with QR and key details.

---

## 8. Security Considerations

Key controls in the pass/QR subsystem:

- **Signed QR tokens**
  - Prevent tampering with pass IDs and types.
  - Only backend can generate valid signatures (has `QR_SECRET_KEY`).

- **Expiry enforcement**
  - QR tokens are valid only until `exp`.
  - Prevents reuse of old screenshots / printed codes in later events.

- **Organizer role checks**
  - Only organizers can call scan/check‑in endpoints.
  - Validated via Firebase Admin + Firestore `isOrganizer` field.

- **Rate limiting**
  - Protects scan/check‑in APIs from abuse and accidental rapid firing.

- **Firestore rules**
  - Ensure:
    - Users can only read their own passes.
    - Only organizers can update passes/teams.
    - No client can create or delete `passes`/`teams` records directly.

---

## 9. Developer Notes

- To generate **test QR codes** without going through full payment:
  - Use `POST /api/passes/qr` with a sample payload.
  - Or run QR testing scripts under `scripts/testing/`.
- If QR scanning fails:
  - Verify `QR_SECRET_KEY` is set correctly and consistently across environments.
  - Confirm that token format and expiry logic match between generator and verifier.

For backend contracts and scan API details, see `BACKEND_API_REFERENCE.md`. For how passes tie into payment state, see `PAYMENT_WORKFLOW.md`.

