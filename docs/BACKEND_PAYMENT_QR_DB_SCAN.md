# Backend Scan: Payment, QR Code & Database Connectivity

**Last scan:** 2026-02-23

This document summarizes the payment flow, QR code generation, and Firestore usage across the backend, and the fixes applied.

---

## 1. Database Connectivity (Firestore)

### 1.1 Initialization (`src/lib/firebase/adminApp.ts`)

- **Single app:** `getAdminApp()` returns the same Firebase Admin app; `getAdminFirestore()` and `getAdminAuth()` use it.
- **Credentials:** Supports either `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string) or `FIREBASE_ADMIN_CLIENT_EMAIL` + `FIREBASE_ADMIN_PRIVATE_KEY`.
- **Fix applied:** `JSON.parse(serviceAccountKey)` is wrapped in try/catch so invalid JSON returns a clear error instead of a generic parse failure.

### 1.2 Collections Used

| Collection            | Used by                                                                 | Purpose |
|-----------------------|-------------------------------------------------------------------------|---------|
| `payments`            | create-order, verify, webhook, fix-stuck-payment, reconcile             | Payment records (orderId/cashfreeOrderId, userId, passType, amount, status) |
| `passes`              | verify, webhook, fix-stuck-payment, scan, users/passes, passes/[id], qr | Pass + QR (paymentId, userId, qrCode, status, eventAccess, teamSnapshot) |
| `users`               | verify, webhook, fix-stuck-payment, profile, passes, scan, scan-member  | User profile, isOrganizer |
| `teams`               | create-order, verify, webhook, fix-stuck-payment, scan-member           | Group event teams |
| `events`              | eventsCache (used by verify, webhook, fix-stuck-payment)                 | Active events for eventAccess |
| `mockSummitCountries` | create-order, mock-summit/countries, assign-country                     | Mock Summit |
| `mockSummitAccessCodes`| create-order                                                            | Access codes |

### 1.3 Key Field Consistency

- **Payment doc:** `payments/{orderId}` with `cashfreeOrderId: orderId`. Lookup by `cashfreeOrderId == orderId` or `doc(orderId)`.
- **Pass doc:** `passes/{passId}` with `paymentId: orderId` (Cashfree order_id). Cross-check payments ↔ passes using `paymentId` / `cashfreeOrderId` / `orderId`.

---

## 2. Payment Flow & DB Writes

| Step              | Route / Source      | DB Read                    | DB Write |
|-------------------|---------------------|----------------------------|----------|
| Create order      | POST /api/payment/create-order | users (auth), mockSummit*, events cache | `payments` (doc orderId), `teams` (if group) |
| Payment success   | Cashfree webhook    | `payments` (by cashfreeOrderId) | `payments` (status success), `passes` (create), `teams` (passId, paymentStatus) |
| Verify (client)   | POST /api/payment/verify | `payments`, `users`, `passes`, `teams` (if group) | `payments` (status), `passes` (create), `teams` (if group) |
| Fix stuck         | POST /api/admin/fix-stuck-payment | `payments`, `passes`, `users`, `teams` | Same as verify (pass + optional team update) |

**Fixes applied:**

- **Verify:** Already validated `userId`, `passType`, `amount`; normalized `selectedEvents` / `selectedDays`; typed variables to satisfy email/PDF.
- **Webhook:** Now validates `userId`, `passType`, `amount` before use; adds `selectedEvents`, `selectedDays`, `eventAccess` to pass document; uses typed `userId`, `passType`, `amount`, `teamId` for Firestore and email/PDF.
- **Fix-stuck-payment:** Validates payment record (userId, passType, amount); normalizes `selectedEvents` / `selectedDays`; uses `teamId` only when it’s a string.

---

## 3. QR Code Generation & DB

### 3.1 Two QR Formats (Intentional)

- **Verify & fix-stuck-payment:** Use `encryptQRData()` (AES-256-CBC). QR contains `IV:hex`. Scan API decrypts and uses `decrypted.id` as passId.
- **Webhook:** Uses `createQRPayload()` (signed token in JSON). QR contains `{ passId, userId, passType, token }`. Scan API uses `verifySignedQR(parsed.token)` to get passId.

### 3.2 Scan API (`POST /api/passes/scan`)

- Accepts both formats; resolves `passId`; loads `passes/{passId}` from Firestore; updates `status: 'used'`, `usedAt`, `scannedBy`.
- **Fix applied:** Request body is parsed with try/catch; invalid JSON returns 400.

### 3.3 QR → DB Link

- Pass is always created in Firestore with `qrCode` (data URL of the QR image).
- My Pass page reads `passes` where `userId == uid` and `status == 'paid'` and displays `pass.qrCode`.
- Scan reads the pass by `passId` (from QR) and updates the same document.

### 3.4 Env Required for QR

- **QR_SECRET_KEY:** Required by `qrService` (createSignedQR, verifySignedQR). Used by webhook and scan (signed format).
- **QR_ENCRYPTION_KEY:** 32 chars, required by `qrEncryption` (encrypt/decrypt). Used by verify, fix-stuck-payment, and scan (encrypted format).

---

## 4. Connectivity & Error Handling

- **Firebase missing:** Any route that calls `getAdminFirestore()` or `getAdminAuth()` will throw and return 500 until credentials are set.
- **Events cache:** `getCachedEventsByIds` uses `getAdminFirestore()` and reads `events`; cache has 5‑min TTL. If Firestore is down, cache refresh fails; verify/webhook/fix-stuck still run but without eventAccess (handled).
- **Create-order:** On Cashfree or Firestore failure, returns 500; team cleanup on Cashfree error is in place.
- **Webhook:** Returns 200 with `{ ok: true }` when payment not found (e.g. webhook before create-order); returns 500 on processing error so Cashfree can retry.

---

## 5. Files Touched in This Scan

| File | Changes |
|------|---------|
| `app/api/webhooks/cashfree/route.ts` | Validate payment fields; add eventAccess/selectedEvents/selectedDays to pass; typed userId/passType/amount/teamId; use getCachedEventsByIds for eventAccess. |
| `app/api/admin/fix-stuck-payment/route.ts` | Validate payment (userId, passType, amount); normalize selectedEvents/selectedDays/teamId; use local teamId in both group blocks. |
| `app/api/passes/scan/route.ts` | Safe req.json() parse; return 400 on invalid JSON. |
| `src/lib/firebase/adminApp.ts` | Try/catch around JSON.parse(serviceAccountKey) with clear error message. |

---

## 6. Quick Verification Checklist

- [ ] Env: `FIREBASE_*`, `QR_SECRET_KEY`, `QR_ENCRYPTION_KEY` (32 chars for verify/fix-stuck/scan decrypt), Cashfree keys.
- [ ] Create order → payment doc in `payments` with `cashfreeOrderId`.
- [ ] Webhook or verify → pass doc in `passes` with `paymentId`, `qrCode`, `eventAccess` (and teamSnapshot for group).
- [ ] My Pass → query `passes` by `userId` and `status === 'paid'`.
- [ ] Scan → resolve passId from QR (signed or encrypted), update pass `status: 'used'`, `usedAt`, `scannedBy`.
- [ ] Reconcile: `GET /api/admin/reconcile-payments` and `?fix=1` only for payments with `status === 'success'` and no pass.
