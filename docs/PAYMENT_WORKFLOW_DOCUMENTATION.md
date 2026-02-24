## Payment Workflow Documentation

This document describes the full Cashfree payment lifecycle implemented in this repository, including order creation, webhook handling, verification, pass creation, idempotency, and recovery paths.

All behavior is taken from:

- `app/api/payment/create-order/route.ts`
- `app/api/webhooks/cashfree/route.ts`
- `app/api/payment/verify/route.ts`
- `app/api/admin/reconcile-payments/route.ts`
- `app/api/admin/fix-stuck-payment/route.ts`
- Supporting modules under `src/lib/**`, `src/types/**`, and `src/features/**`.

---

### Overview

The payment workflow integrates Cashfree PG with Firestore and a pass/QR system:

1. **Order creation** (`/api/payment/create-order`)
   - Validates pass type, amount, event selection, and mock summit constraints.
   - Creates a `payments/{orderId}` document and, for group events, a `teams/{teamId}` document.
   - Calls Cashfree `/orders` API to obtain `order_id` and `payment_session_id`.
2. **Payment processing**
   - Frontend uses Cashfree JS SDK to render checkout using `payment_session_id`.
   - Cashfree redirects to `return_url` and triggers a webhook to `notify_url`.
3. **Webhook handling** (`/api/webhooks/cashfree`)
   - Verifies request signature.
   - Marks payment `status = "success"` and creates a pass (if none exists).
4. **Verification endpoint** (`/api/payment/verify`)
   - Used by frontend callback pages to confirm status.
   - Polls Cashfree if necessary; ensures payment is `PAID`.
   - Creates a pass if not already created, or reuses the existing one.
5. **Admin recovery** (`/api/admin/reconcile-payments` + `/api/admin/fix-stuck-payment`)
   - Detects `payments` with missing `passes`.
   - Optionally repairs them using Cashfree status and consistent pass creation logic.

All pass-creation routines are designed to be **idempotent**, so running any of them multiple times for the same order never results in duplicate passes.

---

### Detailed Create-Order Logic

**Endpoint**: `POST /api/payment/create-order`

#### Inputs & Authentication

- Inputs (body fields) include:
  - `userId`, `amount`, `passType`
  - `teamData` (`name`, `email`, `phone`, `college`)
  - `teamId`, `teamMemberCount`, `selectedDays`, `selectedEvents`
  - `mockSummitAccessCode`, `countryId`
  - Optional `members` array for group events
- Authentication:
  - Requires `Authorization: Bearer <ID_TOKEN>`.
  - Verifies ID token with Firebase Admin.
  - Confirms `decoded.uid === userId` to prevent impersonation.
- Rate limiting:
  - `5` requests per minute per IP.

#### Pass Type & Amount Validation

- Pass type:
  - Must be one of `PASS_TYPES` from `src/types/passes.ts`.
- Amount:
  - For `group_events`:
    - `expectedAmount = teamMemberCount * (pricePerPerson || 250)`.
  - For `day_pass`:
    - `expectedAmount = selectedDays.length * 500`.
  - For other passes:
    - `expectedAmount = PASS_TYPES[passType].price`.
  - If `amount !== expectedAmount`, the request is rejected with `400 "Invalid amount"`.

#### Event Selection and Validation

- `selectedEvents` is required and non-empty.
- Uses `getCachedEventsByIds(selectedEvents)` to fetch event metadata.
- Validations:
  - Every event must exist and `isActive === true`.
  - For `day_pass`:
    - Each event’s `date` must be in `selectedDays`.
  - For `group_events`:
    - Exactly one `selectedEvents` value.
    - Event `type === 'group'`.
    - `teamMemberCount` satisfies `[minMembers, maxMembers]`.
  - For `proshow`:
    - Only dates in `['2026-02-26', '2026-02-28']` allowed.
  - For all pass types except `test_pass`:
    - Each event’s `allowedPassTypes` includes `passType`.

#### Mock Global Summit Validation

If `selectedEvents` includes `"mock-global-summit"` and `passType` is one of `day_pass`, `proshow`, or `sana_concert`:

- `countryId` must be supplied:
  - Fetch `mockSummitCountries/{countryId}`.
  - Must exist and `assignedTo === userId`; otherwise:
    - 400 `"Invalid country."` or 409 `"This country is not assigned to you"`.
- `mockSummitAccessCode` must be supplied:
  - Fetch `mockSummitAccessCodes/{code}`.
  - Must exist, `active === true`, `expiresAt` in the future, and `usedCount < maxUsage`.
  - If checks fail: `400 "Invalid or expired access code."`.
  - On success: increments `usedCount` using `FieldValue.increment(1)`.
- Exclusivity:
  - The mock summit event cannot be combined with other events on the same date.

#### Phone & Customer Details

- `customerPhone` derives from `teamData.phone`:
  - Non-digits stripped.
  - At least 10 digits; if exactly 10 and without `+`, `+91` prefix added.
- `customerName` and `customerEmail` from `teamData` are optional; included when non-empty.

#### Cashfree Order Creation

- Endpoint: `POST ${CASHFREE_BASE}/orders`
  - `CASHFREE_BASE` depends on `NEXT_PUBLIC_CASHFREE_ENV`:
    - Production: `https://api.cashfree.com/pg`.
    - Else: `https://sandbox.cashfree.com/pg`.
- Headers:
  - `x-client-id`: `NEXT_PUBLIC_CASHFREE_APP_ID` or `CASHFREE_APP_ID`.
  - `x-client-secret`: `CASHFREE_SECRET_KEY`.
  - `x-api-version`: `"2025-01-01"`.
- Body:
  - `order_id`: generated `orderId`.
  - `order_amount`: validated `amount`.
  - `order_currency`: `"INR"`.
  - `customer_details`: id, phone, optional name and email.
  - `order_meta`:
    - `return_url`: `<baseUrl>/payment/callback?order_id=${orderId}`.
    - `notify_url`: `<baseUrl>/api/webhooks/cashfree`.

If Cashfree returns a non-OK response:

- Deletes the `teams/{teamId}` doc if it was just created and `passType === 'group_events'`.
- Returns a `500` with a cleaned-up error message.

#### Payments & Teams Persistence

On success:

- Writes `payments/{orderId}`:
  - All validated fields and metadata (userId, amount, passType, selectedDays/Events, mock summit details, etc.).
  - `status: "pending"`.
  - `createdAt: new Date()`.
- For `group_events`:
  - Creates or updates `teams/{teamId}` with:
    - Leader info from `teamData`.
    - `members` array including leader and each submitted member, with initial `attendance.checkedIn = false`.
    - `totalMembers`, `totalAmount`, `status: "pending"`, `paymentStatus: "pending"`, `orderId`, `createdAt`, `updatedAt`.

The response to the client includes:

- `orderId` and `sessionId` (Cashfree `payment_session_id`) for JS SDK checkout.

---

### Webhook Handling

**Endpoint**: `POST /api/webhooks/cashfree`

#### Signature Verification

- Headers:
  - `x-webhook-timestamp`
  - `x-webhook-signature`
- Body:
  - Raw text via `req.text()`.
- Secrets:
  - `CASHFREE_WEBHOOK_SECRET_KEY` (preferred).
  - `CASHFREE_SECRET_KEY` (fallback).
- Verification attempts:
  1. `webhookSecret` with `timestamp + rawBody`.
  2. `apiSecret` with `timestamp + rawBody`.
  3. `webhookSecret` with `timestamp + "." + rawBody`.
  4. `apiSecret` with `timestamp + "." + rawBody`.
- All use `HMAC-SHA256` with base64 digest.
- If none match:
  - Logs diagnostic (without leaking payload).
  - Returns `401 Invalid signature`.

#### Payload Handling

- Parses JSON into `payload`.
- If `payload.type !== "PAYMENT_SUCCESS_WEBHOOK"`:
  - Logs and returns `{ ok: true }` (non-success events ignored).
- Extracts `orderId = payload.data.order.order_id`.
  - If missing: logs and returns `{ ok: true }`.

#### Firestore Logic

1. Lookup `payments`:
   - `payments.where('cashfreeOrderId', '==', orderId).limit(1)`.
   - If none: logs warning and returns `{ ok: true }` (webhook may precede DB write).
2. Validate `paymentData` has `userId`, `passType`, and numeric `amount`.
3. Update payment status:
   - `status: "success"`, `updatedAt: serverTimestamp()`.
4. Compute event access:
   - `selectedEvents` and `selectedDays` read from payment.
   - `getCachedEventsByIds(selectedEvents)` used to set:
     - `tech`, `nonTech`.
     - `proshowDays` (for proshow passes).
     - `fullAccess` (for SANA concert passes).
5. Transaction: create pass if absent
   - Query `passes` where `paymentId == orderId` (limit 1).
   - If present: return `{ created: false, passId }`.
   - Otherwise:
     - Create new `passRef` in `passes`.
     - Generate `qrData` with `createQRPayload(passRef.id, userId, passType)` (HMAC-signed token).
     - `qrCodeUrl = QRCode.toDataURL(qrData)`.
     - Build `passData` with `userId`, `passType`, `amount`, `paymentId`, `status: "paid"`, `qrCode`, `createdAt`, `selectedEvents`, `selectedDays`, `eventAccess`.
     - Copy `countryId`/`countryName` if present on payment.
     - For `group_events`:
       - Fetch `teams/{teamId}` (if `paymentData.teamId` present).
       - Embed `teamSnapshot` with members and `checkedIn: false`.
       - Update team doc with `passId`, `paymentStatus: "success"`, `updatedAt`.
     - `transaction.set(passRef, passData)`.

#### Email & PDF

- On newly created pass only:
  - Fetch `users/{userId}`.
  - If `email` is present:
    - Build confirmation email via `emailTemplates.passConfirmation`.
    - Fetch `passes/{passId}` to get `teamSnapshot`.
    - Generate PDF buffer via `generatePassPDFBuffer`.
    - Send via `sendEmail` with attachment; on PDF failure, fallback to a non-attached email.

---

### Verify Endpoint

**Endpoint**: `POST /api/payment/verify`

#### Primary Use Cases

- Called by:
  - `/payment/callback` and `/payment/success` pages after redirect from Cashfree.
- Goals:
  - Provide user feedback on payment status.
  - Recover in cases where:
    - Webhook ran but pass creation partially failed.
    - Webhook has not yet arrived but the user wants to confirm payment.

#### Core Flow

1. Parse and validate `orderId` from JSON body; reject if missing.
2. Lookup `payments` with retry:
   - Try query by `cashfreeOrderId`.
   - Fallback to direct doc `payments/{orderId}`.
   - Retry up to 3 times with 1s delay.
3. If not found after retries:
   - Returns `404` with explanatory diagnostic (`"Payment record not found in database"`).
4. Validate `paymentData` essential fields (`userId`, `passType`, `amount`).
5. If `paymentData.status === 'success'`:
   - Skip Cashfree poll; update `updatedAt` and move straight to pass creation.
6. Otherwise:
   - Poll Cashfree order API up to 5 times with 2s delay:
     - If `order_status !== 'PAID'`: return `400` with `status` and advice to retry later.
     - If `order_status === 'PAID'`:
       - Update payment doc `status: 'success'`, `updatedAt`.
7. Compute event access as described earlier using `getCachedEventsByIds`.
8. Transaction for pass creation (idempotent):
   - Same pattern as webhook: check for existing pass with `paymentId == orderId`, else create with encrypted QR payload.
9. If pass newly created:
   - Send confirmation email with PDF, using the same logic as webhook.

#### Output

- On success:
  - `{ success: true, passId, qrCode, message?: "Pass already exists" }`.
- On partial or pending states:
  - `400` with `status` from Cashfree and explicit message to retry verification.
- On fatal errors:
  - `500` with `error` and `details` stack trace (intended for debugging; logs contain more detail).

---

### Idempotency Safeguards

Pass creation is guarded at multiple levels:

- **Transactions check for existing passes**:
  - All three pass-creating paths (webhook, verify, admin fix) begin by querying:
    - `passes.where('paymentId', '==', orderId).limit(1)` inside a Firestore transaction.
  - If a pass exists:
    - They return the existing `passId` and `qrCode` without creating a duplicate.

- **Payment status gating**:
  - Webhook and verify routes update `payments.status` to `'success'` once a `PAID` status is observed.
  - If verify or admin fix runs after webhook, they see `status === 'success'` and can proceed straight to pass creation (still guarded with the transaction).

These safeguards ensure:

- Duplicate webhooks for the same order are harmless.
- Repeated calls to `/api/payment/verify` for the same `orderId` are safe.
- Admin repair tools can be run on a problematic order without risk of double issuance.

---

### Stuck Payment Recovery

Two admin endpoints are dedicated to diagnosing and fixing mismatches between payments and passes.

#### `GET /api/admin/reconcile-payments`

- Compares:
  - All `payments` documents.
  - All `passes` documents.
- Builds:
  - `withPass`: payments where `passes.paymentId == orderId`.
  - `withoutPass`: successful payments without passes.
- For each `withoutPass` record:
  - Includes a `callbackUrl` (e.g., `/payment/callback?order_id=...`) that can be shared with the affected user.
- Optional `fix` mode:
  - When `?fix=1` is present:
    - For each `withoutPass` payment with `status === 'success'`:
      - Calls `POST /api/admin/fix-stuck-payment` with `{ orderId }`.
    - Collects results in a `fixed` array.

This endpoint is not protected at the app level; comments explicitly instruct infra-level protection.

#### `POST /api/admin/fix-stuck-payment`

- Input: `{ orderId: string }`.
- Behavior:
  1. Reads `payments/{orderId}` (or where `cashfreeOrderId == orderId`).
  2. If `status !== 'success'`:
     - Polls Cashfree to confirm `order_status === 'PAID'`.
     - Updates payment `status: 'success'`, `updatedAt`.
  3. Computes event access using `getCachedEventsByIds`.
  4. Runs the same pass-creation transaction used by `/api/payment/verify`:
     - Checks for existing `passes` with `paymentId == orderId`.
     - Creates an encrypted QR pass if missing, updating `teams/{teamId}` and generating `teamSnapshot`.
  5. Sends pass confirmation email with PDF to the user.

This ensures that operators can fix cases where a payment is successful but a pass is missing, without duplicating passes.

---

### Environment Separation

Environment control is done via env vars:

- `NEXT_PUBLIC_CASHFREE_ENV`:
  - `'production'` → Prod endpoints.
  - Any other value → Sandbox endpoints.
- Client & server:
  - **Server**:
    - Reads `NEXT_PUBLIC_CASHFREE_ENV`, `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_WEBHOOK_SECRET_KEY`.
  - **Client**:
    - `NEXT_PUBLIC_CASHFREE_ENV` configures Cashfree JS SDK mode in `cashfreeClient.ts`.
- Base URLs:
  - `NEXT_PUBLIC_APP_URL` preferred for callback and webhook URLs.
  - Fallback to `APP_URL`.
  - If neither set, a dynamic base is constructed from `Host` and `x-forwarded-proto`.

This allows:

- Clearly separated sandbox and production flows.
- Testing in lower environments without interfering with production keys.

---

### Mermaid: Full Lifecycle Overview

```mermaid
sequenceDiagram
  autonumber
  participant U as User Browser
  participant UI as Next.js UI
  participant CO as /api/payment/create-order
  participant CF as Cashfree
  participant WH as /api/webhooks/cashfree
  participant VE as /api/payment/verify
  participant AD as /api/admin/*
  participant FS as Firestore

  U->>UI: Choose pass & events (register/pass)
  UI->>CO: POST create-order (ID token, pass details)
  CO->>FS: Write payments (pending) [+teams if group]
  CO->>CF: POST /orders (create order)
  CF-->>CO: order_id + payment_session_id
  CO-->>UI: { orderId, sessionId }
  UI->>CF: Open checkout via JS SDK
  CF-->>U: Payment UI and redirect to return_url

  CF->>WH: POST webhook (PAYMENT_SUCCESS_WEBHOOK)
  WH->>FS: Mark payment success
  WH->>FS: Tx: create passes entry if missing
  WH-->>CF: 200 OK

  U->>UI: Land on /payment/callback?order_id=...
  UI->>VE: POST verify(orderId)
  VE->>FS: Lookup payment record
  alt status != success
    VE->>CF: GET /orders/{orderId}
    CF-->>VE: order_status
    VE->>FS: Update payment status success (if PAID)
  end
  VE->>FS: Tx: create pass if missing; else reuse
  VE-->>UI: { success, passId, qrCode? }
  UI->>FS: Fetch passes for /register/my-pass
  UI-->>U: Show "My Pass" with QR & lanyard

  AD->>FS: Scan payments vs passes (reconcile-payments)
  AD->>/api/admin/fix-stuck-payment: POST {orderId}
  /api/admin/fix-stuck-payment->>CF: GET /orders/{orderId}
  /api/admin/fix-stuck-payment->>FS: Tx: create pass if missing; else reuse
```

This diagram directly reflects the API handlers and Firestore operations implemented in the code.

