## Backend API Architecture

This document catalogs all backend API routes implemented under `app/api/**`, including their responsibilities, request/response shapes (informal), authentication, rate limiting, error handling, and idempotency strategies.

All descriptions are based strictly on the source files in this repository.

---

### Overview of API Domains

APIs are organized by domain:

- **Events**
  - `GET /api/events`
  - `GET /api/events/invalidate`
- **Users**
  - `GET /api/users/profile`
  - `POST /api/users/profile`
  - `GET /api/users/passes`
  - `GET /api/users/referral-code` (stub: 404)
- **Payments**
  - `POST /api/payment/create-order`
  - `POST /api/payment/verify`
  - `POST /api/webhooks/cashfree`
- **Passes & QR**
  - `GET /api/passes/types`
  - `GET /api/passes/[passId]`
  - `GET /api/passes/qr`
  - `POST /api/passes/scan`
  - `POST /api/passes/scan-member`
- **Mock Summit**
  - `GET /api/mock-summit/countries`
  - `POST /api/mock-summit/assign-country`
  - `POST /api/referral/apply` (stub: 404)
- **Admin Tooling**
  - `GET /api/admin/reconcile-payments`
  - `POST /api/admin/fix-stuck-payment`

All route handlers use the Next.js App Router file convention: `app/api/<segments>/route.ts`.

---

### Common Infrastructure

#### Firebase Admin

- All routes that require authentication or Firestore writes use:
  - `getAdminAuth()` and `getAdminFirestore()` from `src/lib/firebase/adminApp.ts`.
  - The Admin app is initialized once per process using service account credentials from environment variables.

#### Rate Limiting

- Implemented by `checkRateLimit(req, options)` in `src/lib/security/rateLimiter.ts`.
- Strategy:
  - Per-IP in-memory counter with window-based reset.
  - Returns a `429` `NextResponse` with a `Retry-After` header when the limit is exceeded.
- Applied to:
  - `POST /api/payment/create-order` – max 5 requests per minute.
  - `POST /api/payment/verify` – max 10 requests per minute.
  - `POST /api/users/profile` – max 5 requests per minute.
  - `POST /api/passes/scan` – max 10 requests per minute.
  - `POST /api/passes/scan-member` – max 20 requests per minute.

#### Events Cache

- Implemented in `src/lib/cache/eventsCache.ts`.
- Routes like `/api/events`, `/api/payment/create-order`, `/api/payment/verify`, `/api/webhooks/cashfree`, and admin routes rely on the cached `events` data:
  - `getCachedEvents()` and `getCachedEventsByIds(ids)` avoid repeated Firestore reads.
  - In-memory cache with TTL (~5 minutes) and single-flight behavior for concurrent refreshes.
  - `GET /api/events/invalidate` clears cache to force refresh on the next request.

---

### Events APIs

#### `GET /api/events`

- **File**: `app/api/events/route.ts`
- **Purpose**: Public API to retrieve active events, with optional filtering.
- **Auth**: None (public).
- **Rate limiting**: None.
- **Request**:
  - Query parameters (optional):
    - `date`
    - `type` (`individual` | `group` | `workshop`)
    - `category` (`technical` | `non_technical`)
    - `passType` (matches `PassType` from `firestoreTypes.ts`)
- **Behavior**:
  - Uses `getCachedEvents()` to retrieve all active events (`isActive === true`).
  - Filters based on the provided query parameters.
  - Returns an array of `Event` objects.
- **Response**:
  - `200 OK` with JSON array of events.
  - Adds `Cache-Control: no-store` to avoid client-side caching (server caches via in-memory layer).

#### `GET /api/events/invalidate`

- **File**: `app/api/events/invalidate/route.ts`
- **Purpose**: Operational endpoint to clear the events in-memory cache.
- **Auth**: None in code.
  - Implicitly intended for internal/ops use (e.g., with infra-level restrictions).
- **Rate limiting**: None.
- **Behavior**:
  - Calls `invalidateEventsCache()`.
  - Returns an `ok` response with a message.

---

### User APIs

#### `GET /api/users/profile`

- **File**: `app/api/users/profile/route.ts`
- **Purpose**: Fetch the authenticated user’s profile.
- **Auth**:
  - Requires `Authorization: Bearer <ID_TOKEN>`.
  - Verifies token via `getAdminAuth().verifyIdToken`.
  - Uses `uid` from the token to identify the user.
- **Rate limiting**: None.
- **Behavior**:
  - Reads Firestore document `users/{uid}`.
  - If a profile exists: returns its data.
  - If not: returns `{ profile: null }` or a 404-style response depending on implementation.

#### `POST /api/users/profile`

- **File**: `app/api/users/profile/route.ts`
- **Purpose**: Create or update the authenticated user’s profile on the server.
- **Auth**:
  - Requires `Authorization: Bearer <ID_TOKEN>`.
  - Verifies with `getAdminAuth`.
  - `uid` from the token is used as document ID.
- **Rate limiting**:
  - `checkRateLimit(req, { limit: 5, windowMs: 60000 })`.
- **Request body**:
  - JSON, validated via `userProfileSchema` and helpers in `src/lib/security/validation.ts`:
    - `name`
    - `college`
    - `phone`
    - (Server may also accept `email` inferred from token.)
- **Behavior**:
  - Validates input (lengths, allowed characters, phone format).
  - Writes to `users/{uid}`:
    - On first creation:
      - Sets `isOrganizer: false`.
      - Adds timestamps (`createdAt`, `updatedAt`).
      - Sends a welcome email via Resend (if `email` present).
    - On update:
      - Updates profile fields and `updatedAt`.
- **Response**:
  - `200 OK` with the saved profile (or fields subset).
  - `400 Bad Request` for validation errors.

#### `GET /api/users/passes`

- **File**: `app/api/users/passes/route.ts`
- **Purpose**: List all passes belonging to the authenticated user.
- **Auth**:
  - Requires `Authorization: Bearer <ID_TOKEN>`.
  - Verifies with `getAdminAuth`.
  - Uses `uid` to filter passes.
- **Rate limiting**: None.
- **Behavior**:
  - Queries `passes` collection where `userId == uid`.
  - Maps Firestore timestamps to JS `Date`/string on output.
- **Response**:
  - `200 OK` with array of passes (limited fields: id, type, amount, status, QR, timestamps).

#### `GET /api/users/referral-code`

- **File**: `app/api/users/referral-code/route.ts`
- **Purpose**: Currently a stub; always returns 404 Not Found.
- **Auth**: None relevant.
- **Rate limiting**: None.

#### `POST /api/referral/apply`

- **File**: `app/api/referral/apply/route.ts`
- **Purpose**: Stub; always returns 404.

---

### Payment APIs

#### `POST /api/payment/create-order`

- **File**: `app/api/payment/create-order/route.ts`
- **Purpose**: Validate a requested pass purchase, create a Cashfree order, and persist a pending `payments/{orderId}` record (and `teams/{teamId}` for group events).
- **Auth**:
  - Requires `Authorization: Bearer <ID_TOKEN>`.
  - Verifies token; rejects expired tokens with a user-friendly message.
  - Ensures `decoded.uid === userId` from body (prevents acting on behalf of other users).
- **Rate limiting**:
  - `checkRateLimit(req, { limit: 5, windowMs: 60000 })`.
- **Request body (informal)**:
  - `userId: string`
  - `amount: number`
  - `passType: string` (must match one of `PASS_TYPES` ids)
  - `teamData?: { name, email, phone, college }`
  - `teamId?: string` (required for `group_events`)
  - `teamMemberCount?: number`
  - `selectedDays?: string[]`
  - `selectedEvents?: string[]`
  - `mockSummitAccessCode?: string`
  - `countryId?: string`
  - `members?: { name, email, phone }[]` (for group team members)
- **Validation**:
  - Pass type:
    - Must be one of `PASS_TYPES` from `src/types/passes.ts`.
  - Amount:
    - `group_events`: `teamMemberCount * pricePerPerson` (default 250 if not set in `PASS_TYPES`).
    - `day_pass`: `selectedDays.length * 500`.
    - Other passes: uses static `price` from `PASS_TYPES`.
  - Events:
    - `selectedEvents` is required and non-empty.
    - Uses `getCachedEventsByIds` to fetch all events and verify:
      - All exist and `isActive`.
      - For `day_pass`: each event’s `date` is one of `selectedDays`.
      - For `group_events`:
        - Exactly one event.
        - `event.type === 'group'`.
        - `teamMemberCount` within `[minMembers, maxMembers]`.
      - For `proshow`: events must be on allowed proshow days (`['2026-02-26', '2026-02-28']`).
      - For non-`test_pass` types: each event’s `allowedPassTypes` includes `passType`.
    - Mock summit:
      - If `selectedEvents` includes `'mock-global-summit'` and `passType` is `day_pass`, `proshow`, or `sana_concert`:
        - `countryId` must be provided and correspond to a doc `mockSummitCountries/{countryId}` where `assignedTo == userId`.
        - `mockSummitAccessCode` must be provided, refer to an active `mockSummitAccessCodes/{code}` doc, not expired, and below `maxUsage`.
        - Endpoint increments `usedCount` via `FieldValue.increment(1)`.
      - Enforces date exclusivity: mock summit can’t be combined with other events on the same date.
  - Phone number:
    - Derived from `teamData.phone`, stripped to digits.
    - must be at least 10 digits; if exactly 10 digits and not starting with `+`, prefix `+91`.

- **Cashfree interaction**:
  - Constructs `orderId = "order_" + Date.now() + "_" + userId.substring(0, 8)`.
  - Build `requestBody` with:
    - `order_amount`, `order_currency = "INR"`, `order_id`.
    - `customer_details`: includes `customer_id`, `customer_phone`, and optional `customer_name`, `customer_email`.
    - `order_meta`:
      - `return_url = <baseUrl>/payment/callback?order_id=...`.
      - `notify_url = <baseUrl>/api/webhooks/cashfree`.
  - `baseUrl` resolution:
    - `NEXT_PUBLIC_APP_URL` → `APP_URL` → dynamic from `Host` and `x-forwarded-proto`.
  - Sends `POST ${CASHFREE_BASE}/orders` with:
    - Headers: `x-client-id`, `x-client-secret`, `x-api-version: "2025-01-01"`.
  - On non-OK responses:
    - Logs error.
    - If a `teams/{teamId}` document was created, attempts to delete it.
    - Returns `500` with sanitized error message.

- **Firestore writes**:
  - `payments/{orderId}`:
    - `userId`, `amount`, `passType`, `cashfreeOrderId`, `status: "pending"`, `createdAt: new Date()`.
    - `customerDetails`: name, email, phone.
    - `teamId`, `teamMemberCount`, `selectedDays`, `selectedEvents`.
    - If mock summit selected:
      - `mockSummitSelected: true`, `mockSummitAccessCode`, `countryId`, `countryName`.
  - `teams/{teamId}` (for `group_events`):
    - Creates or updates a team doc:
      - `teamId`, `teamName`, leader info (`leaderId`, `leaderName`, `leaderEmail`, `leaderPhone`, `leaderCollege`).
      - `members`: array including leader + other members, each with attendance state.
      - `totalMembers`, `totalAmount`, `status: "pending"`, `orderId`, `paymentStatus: "pending"`, timestamps.
    - If team already exists:
      - Only updates `orderId`, `paymentStatus`, and `updatedAt`.

- **Response**:
  - `200 OK` with:
    - `orderId` (Cashfree order id).
    - `sessionId` (Cashfree `payment_session_id`).
  - `4xx/5xx` with error messages for validation, config, or Cashfree failure.

#### `POST /api/payment/verify`

- **File**: `app/api/payment/verify/route.ts`
- **Purpose**: Verify a Cashfree order, ensure payment is successful, and create a pass if not already created (idempotent with webhook).
- **Auth**: No Firebase auth required (user is implicitly identified by order/payment).
- **Rate limiting**:
  - `checkRateLimit(req, { limit: 10, windowMs: 60000 })`.
- **Request body**:
  - `{ "orderId": string }`.
- **Behavior**:
  1. **Input validation**:
     - Ensures a non-empty `orderId` string; else `400`.
  2. **Payment lookup (with retries)**:
     - Attempts up to 3 times to find a payment:
       - Query `payments` where `cashfreeOrderId == orderId` (limit 1).
       - If none found, tries direct doc id `payments/{orderId}`.
       - Waits 1 second between attempts if not found.
     - If still not found: `404` with diagnostic message.
     - Ensures payment doc has `userId`, `passType`, and numeric `amount`; else `500`.
  3. **Cashfree status polling** (if payment not already `success`):
     - Uses `NEXT_PUBLIC_CASHFREE_APP_ID` / `CASHFREE_APP_ID` + `CASHFREE_SECRET_KEY`.
     - Polls `GET ${CASHFREE_BASE}/orders/{orderId}` up to 5 times with 2s delay.
     - If `order_status === "PAID"`:
       - Updates payment doc `status: "success"`, `updatedAt: new Date()`.
     - Else:
       - Returns `400` with `status` and error message advising retry.
  4. **Event access computation**:
     - Reads `selectedEvents` and `selectedDays` from payment doc (if arrays).
     - Uses `getCachedEventsByIds(selectedEvents)` to determine:
       - `hasTechEvents` and `hasNonTechEvents` based on `category`.
  5. **Pass creation transaction**:
     - Uses `db.runTransaction` to ensure idempotency with webhook:
       - First query: `passes` where `paymentId == orderId` (limit 1).
       - If an existing pass is found:
         - Returns `{ created: false, passId, qrCode? }` from within the transaction.
       - Otherwise:
         - Fetches `users/{userId}` for user name/college/phone.
         - Depending on pass type and `paymentData.teamId`:
           - For `group_events`:
             - Attempts to read `teams/{teamId}`.
             - Builds `qrData` with team name and member list.
           - For non-group passes:
             - Builds `qrData` with user name and events/days.
         - Imports `encryptQRData` from `@/lib/crypto/qrEncryption`.
         - Encrypts `qrData` and generates QR code data URL via `QRCode.toDataURL`.
         - Builds `passData`:
           - `userId`, `passType`, `amount`, `paymentId: orderId`, `status: "paid"`, `qrCode`, `createdAt: new Date()`.
           - `selectedEvents`, `selectedDays`.
           - `eventAccess`:
             - `tech`, `nonTech` from computed flags.
             - `proshowDays`: `['2026-02-26', '2026-02-28']` for `proshow` passes.
             - `fullAccess`: `true` for `sana_concert` passes.
           - If `countryId`/`countryName` exist on payment, copy them.
           - For `group_events`, also:
             - `teamId`.
             - `teamSnapshot`: immutable snapshot of team at payment time, marking all members `checkedIn: false`.
             - Updates `teams/{teamId}` inside transaction: `passId: passRef.id`, `paymentStatus: "success"`, `updatedAt: new Date()`.
         - Writes pass doc and returns `{ created: true, passId, qrCode }`.
  6. **Email sending (only when pass newly created)**:
     - Outside transaction:
       - Fetches `users/{userId}`.
       - If `email` present:
         - Builds `emailTemplate` via `emailTemplates.passConfirmation`.
         - Fetches `passes/{passId}` to include `teamSnapshot` if present.
         - Generates a PDF buffer via `generatePassPDFBuffer`.
         - Sends via Resend with the PDF attached.
         - On PDF generation error, falls back to sending without attachment.

- **Response**:
  - On success:
    - `200 OK`:
      - `{ success: true, passId, qrCode, message?: "Pass already exists" }`.
  - On validation, lookup, or Cashfree errors:
    - `4xx/5xx` with detailed error and `details` field where available.

Idempotency is enforced by the transaction’s initial query for existing passes with the same `paymentId`.

#### `POST /api/webhooks/cashfree`

- **File**: `app/api/webhooks/cashfree/route.ts`
- **Purpose**: Handle Cashfree webhook callbacks, validate signatures, and create passes when payments succeed.
- **Auth/Security**:
  - HMAC-SHA256 validation of `x-webhook-signature` against:
    - `CASHFREE_WEBHOOK_SECRET_KEY` and/or `CASHFREE_SECRET_KEY`.
    - Payload `signedPayload` variants:
      - `timestamp + rawBody`
      - `timestamp + "." + rawBody`
  - If none of the four combinations validate:
    - Logs diagnostics and returns `401 Invalid signature`.
- **Rate limiting**: None (rely on Cashfree sending reasonable volume and webhook secrets).
- **Behavior**:
  1. Read `x-webhook-timestamp`, `x-webhook-signature`, and raw body via `req.text()`.
  2. Log a body fingerprint (SHA-256 prefix) for debugging but not the full payload.
  3. Verify signature using combinations of secrets and payload formats.
  4. Parse JSON payload:
     - Expect `payload.type === "PAYMENT_SUCCESS_WEBHOOK"`.
     - Ignore other types; respond `{ ok: true }`.
  5. Extract `orderId` from `payload.data.order.order_id`.
     - If missing: log and return `{ ok: true }`.
  6. Firestore operations:
     - Lookup `payments` where `cashfreeOrderId == orderId` (limit 1).
     - If none found:
       - Log a warning and return `{ ok: true }` (webhook may have arrived before order creation completed).
     - Validate `paymentData.userId`, `passType`, `amount`.
     - Update payment doc: `status: "success"`, `updatedAt: serverTimestamp()`.
     - Compute event access (`tech`, `nonTech`) via `getCachedEventsByIds`.
     - Run transaction:
       - Query `passes` where `paymentId == orderId` (limit 1).
       - If pass exists:
         - Return `{ created: false, passId }`.
       - Else:
         - Create new pass doc:
           - Generate `qrData` using `createQRPayload(passRef.id, userId, passType)` (HMAC-signed token).
           - Generate QR data URL via `QRCode.toDataURL(qrData)`.
           - Store `userId`, `passType`, `amount`, `paymentId`, `status: "paid"`, `qrCode`, `createdAt: serverTimestamp()`.
           - `selectedEvents`, `selectedDays`.
           - `eventAccess` computed from events (`tech`, `nonTech`, `proshowDays`, `fullAccess`).
           - Group events:
             - Query `teams/{teamId}` if `paymentData.teamId` present.
             - Attach `teamSnapshot` and update team doc with `passId` and `paymentStatus: "success"`.
  7. Email sending:
     - On newly created pass only:
       - Fetch `users/{userId}`.
       - If `email` exists:
         - Build pass confirmation template.
         - Fetch the pass to include `teamSnapshot` in PDF.
         - Generate PDF via `generatePassPDFBuffer`.
         - Send email with PDF attachment; on error, fallback to email without attachment.

- **Response**:
  - Generally `{ ok: true }` or an error JSON.

Idempotency is again enforced via transaction-level check for existing passes with `paymentId == orderId`.

---

### Pass & QR APIs

#### `GET /api/passes/types`

- **File**: `app/api/passes/types/route.ts`
- **Purpose**: Expose canonical pass types and pricing from `PASS_TYPES` for frontend use.
- **Auth**: None.
- **Rate limiting**: None.
- **Behavior**:
  - Returns a JSON object mapping pass ids to metadata (title, description, price, etc.).

#### `GET /api/passes/[passId]`

- **File**: `app/api/passes/[passId]/route.ts`
- **Purpose**: Fetch details for a single pass.
- **Auth**:
  - Requires `Authorization: Bearer <ID_TOKEN>`.
  - Verifies with `getAdminAuth`.
- **Authorization**:
  - Reads `passes/{passId}`; then:
    - Allows if `pass.userId === uid`, or
    - If `users/{uid}.isOrganizer === true`.
- **Rate limiting**: None.
- **Behavior**:
  - Returns pass data with normalized timestamps (converting Firestore `Timestamp` to `Date`/string).

#### `GET /api/passes/qr`

- **File**: `app/api/passes/qr/route.ts`
- **Purpose**: Generate a fresh QR code for a given pass, for the pass owner or an organizer.
- **Auth**:
  - Requires `Authorization: Bearer <ID_TOKEN>`.
- **Authorization**:
  - Fetches `passes/{passId}` and `users/{uid}`; allows if:
    - `pass.userId === uid`, or
    - `user.isOrganizer === true`.
- **Rate limiting**: None.
- **Behavior**:
  - Uses `createQRPayload(passId, pass.userId, pass.passType)` to generate a signed QR token.
  - Converts to Data URL via `QRCode.toDataURL`.
  - Returns:
    - `qrCode`, `passType`, `userId`, `status`.

#### `POST /api/passes/scan`

- **File**: `app/api/passes/scan/route.ts`
- **Purpose**: Scan and validate a pass QR code at entry; mark pass as used.
- **Auth**:
  - Requires `Authorization: Bearer <ID_TOKEN>`.
  - Organizer-only:
    - Verifies `users/{uid}.isOrganizer === true` via Firestore Admin.
- **Rate limiting**:
  - `checkRateLimit(req, { limit: 10, windowMs: 60000 })`.
- **Request body**:
  - `{ "qrData": string }` – either:
    - Direct signed token string, or
    - JSON with `token` and additional fields, or
    - Encrypted payload string produced by `encryptQRData`.
- **Behavior**:
  - Attempts to parse `qrData` as JSON; if it contains `token`, uses that; otherwise treats `qrData` as raw token.
  - Tries:
    1. `verifySignedQR(token)`: if valid, extracts `passId`.
    2. If not valid, attempts `decryptQRData(qrData)`; if decrypted object has `id`, uses that as `passId`.
  - If both checks fail: `400 Invalid QR code`.
  - Fetches `passes/{passId}`:
    - If not found: `404`.
    - If `usedAt` already set: `409` with `usedAt`.
    - Else:
      - Updates pass with:
        - `status: "used"`, `usedAt: new Date()`, `scannedBy: organizerUid`.
      - Returns pass summary in response.

#### `POST /api/passes/scan-member`

- **File**: `app/api/passes/scan-member/route.ts`
- **Purpose**: Check in a specific team member for a group event (organizer view).
- **Auth**:
  - Requires `Authorization: Bearer <ID_TOKEN>`.
  - Organizer-only (`users/{uid}.isOrganizer === true`).
- **Rate limiting**:
  - `checkRateLimit(req, { limit: 20, windowMs: 60000 })`.
- **Request body**:
  - `{ "teamId": string, "memberId": string }`.
- **Behavior**:
  - Fetches `teams/{teamId}`.
  - Locates the member by `memberId` in `members` array.
  - If already `attendance.checkedIn === true`, returns `409` with existing `checkInTime`.
  - Otherwise:
    - Uses `arrayRemove` to remove current member object, then `arrayUnion` to insert updated object with:
      - `attendance.checkedIn: true`,
      - `checkInTime: serverTimestamp`,
      - `checkedInBy: organizerUid`.
  - Returns the updated member info on success.

---

### Mock Summit APIs

#### `GET /api/mock-summit/countries`

- **File**: `app/api/mock-summit/countries/route.ts`
- **Purpose**: Return mock summit country documents and assignment status.
- **Auth**: None in code (public).
- **Rate limiting**: None.
- **Behavior**:
  - Reads from `mockSummitCountries` collection via Firestore Admin.
  - Returns a list of countries with fields like `name`, `assignedTo`, and any other metadata present.

#### `POST /api/mock-summit/assign-country`

- **File**: `app/api/mock-summit/assign-country/route.ts`
- **Purpose**: Assign a mock summit country to the authenticated user.
- **Auth**:
  - Requires `Authorization: Bearer <ID_TOKEN>`.
  - Verifies `uid` via `getAdminAuth`.
- **Rate limiting**: None.
- **Behavior**:
  - Uses a Firestore transaction to:
    - Ensure that:
      - Country is unassigned (or meets the intended constraints).
      - User does not already hold a different country.
    - Set `assignedTo` to `uid`.
  - Uses `mockSummitCountries` documents exclusively; `mockSummitAccessCodes` are managed server-only by other routes.

---

### Admin Tooling APIs

#### `GET /api/admin/reconcile-payments`

- **File**: `app/api/admin/reconcile-payments/route.ts`
- **Purpose**: Diagnose and optionally repair mismatches between `payments` and `passes` collections.
- **Auth**:
  - No auth checks in code.
  - Comments instruct deployers to protect this route by infrastructure (IP allowlists, VPN, etc.).
- **Rate limiting**: None.
- **Behavior**:
  1. Reads all `payments` and `passes` from Firestore.
  2. Builds:
     - `withPass`: payments that have a corresponding pass (`passes.paymentId == payment.cashfreeOrderId`).
     - `withoutPass`: payments without a matching pass.
  3. For each `withoutPass` item, includes:
     - Basic payment metadata.
     - A `callbackUrl` to a user-facing page (e.g., `/payment/callback`) that can be shared with the user.
  4. If query string contains `?fix=1`:
     - For each `withoutPass` payment with `status === 'success'`:
       - Calls `POST /api/admin/fix-stuck-payment` with `{ orderId }`, using app base URL from env or host.
       - Collects and returns a list of `fixed` results.

- **Response**:
  - Without `fix=1`:
    - Summary of with/without pass counts and lists.
  - With `fix=1`:
    - Plus `fixed` array describing attempted repairs.

#### `POST /api/admin/fix-stuck-payment`

- **File**: `app/api/admin/fix-stuck-payment/route.ts`
- **Purpose**: For a given `orderId`, ensure the payment is actually captured and create a pass if missing (recovery).
- **Auth**:
  - No auth checks in code; must be infra-protected.
- **Rate limiting**: None.
- **Behavior**:
  1. Reads payment by:
     - Document id `payments/{orderId}`, or
     - Where `cashfreeOrderId == orderId`.
  2. If payment `status !== 'success'`:
     - Re-queries Cashfree `GET /orders/{orderId}` and ensures `order_status === 'PAID'`.
     - Updates payment doc `status: "success"`, `updatedAt: new Date()`.
  3. Computes event access using `getCachedEventsByIds`.
  4. Uses Firestore transaction:
     - If a pass exists with `paymentId == orderId`, returns it unchanged.
     - Else:
       - Fetches `users/{userId}`.
       - Optionally fetches `teams/{teamId}` to build `teamSnapshot`.
       - Uses `encryptQRData` and `QRCode.toDataURL` to produce an encrypted QR payload.
       - Writes `passes/{passId}` with the same structure as `/api/payment/verify` pass creation logic.
       - Updates `teams/{teamId}` with `passId` and `paymentStatus: "success"` if a team exists.
  5. Sends pass confirmation email with PDF, same as verify route:
     - If `email` present on `users/{userId}`.
     - Builds template, fetches pass for snapshot, generates PDF, and calls `sendEmail`.

- **Response**:
  - Indicates whether a new pass was created or an existing one reused.

---

### Authentication & Authorization Patterns

- **ID token verification**:
  - Performed using `getAdminAuth().verifyIdToken(token)` in:
    - `/api/payment/create-order`
    - `/api/users/profile`
    - `/api/users/passes`
    - `/api/passes/[passId]`
    - `/api/passes/qr`
    - `/api/passes/scan`
    - `/api/passes/scan-member`
    - `/api/mock-summit/assign-country`
  - Some routes handle specific error codes (e.g., `auth/id-token-expired`) to provide distinct messages.

- **Organizer role enforcement**:
  - Organizer role is stored in `users/{uid}.isOrganizer` (backend) and constrained in `appUsers/{uid}` by Firestore rules.
  - Organizer-only routes:
    - `/api/passes/scan`
    - `/api/passes/scan-member`
    - Some read paths through Firestore rules (not API-level) for `passes` and `teams` via `appUsers.isOrganizer`.

- **Server vs client responsibilities**:
  - Client can only:
    - Read restricted sets via SDK according to Firestore rules.
    - Call public or semi-public APIs.
  - All critical mutations (payments, passes, teams, mockSummitAccessCodes, registrations) are performed only by Admin SDK routes.

---

### Error Handling & Logging

- Most routes:
  - Log detailed context to `console.log` / `console.error` (including durations for payment verification and webhook handling).
  - Return structured error JSON with `error` and sometimes `details` strings.
- Payment flows:
  - Add clear log markers (`[Order]`, `[Verify]`, `[Webhook]`) to trace through logs.
  - Provide user-facing messages that distinguish between configuration problems, transient payment status, and missing DB records.

---

### Idempotency & Consistency Guarantees

- **Pass creation**:
  - All code paths that create passes (`/api/webhooks/cashfree`, `/api/payment/verify`, `/api/admin/fix-stuck-payment`) use Firestore transactions that:
    - First query for existing passes with `paymentId == orderId`.
    - Only create a new pass when none exist.
  - This protects against:
    - Duplicate webhooks.
    - Users retrying `/api/payment/verify`.
    - Admin reconciliation tools running after a pass has already been created.

- **Payment status updates**:
  - Webhook handler updates payment status to `success` using server timestamps.
  - Verify route and admin fix ensure status is set to `success` after Cashfree confirms `PAID`.
  - Re-running these steps is safe (idempotent) when `status` is already `success`.

---

### Mermaid: High-level Payment API Interaction

```mermaid
sequenceDiagram
  participant UI as Next.js UI
  participant CO as /api/payment/create-order
  participant CF as Cashfree PG
  participant WH as /api/webhooks/cashfree
  participant VE as /api/payment/verify
  participant AD as /api/admin/*
  participant FS as Firestore

  UI->>CO: POST create-order (ID token, pass details)
  CO->>FS: Write payments (pending) [+teams for group]
  CO->>CF: POST /orders
  CF-->>CO: order_id + payment_session_id
  CO-->>UI: orderId + sessionId
  UI->>CF: Open Cashfree checkout

  CF->>WH: POST webhook (PAYMENT_SUCCESS_WEBHOOK)
  WH->>FS: Mark payment success; tx: create pass if none
  WH-->>CF: 200 OK

  UI->>VE: POST verify (orderId)
  VE->>FS: Lookup payment
  alt payment not success
    VE->>CF: GET /orders/{orderId}
    CF-->>VE: order_status
    VE->>FS: Update payment status success
  end
  VE->>FS: Tx: create pass if none; else reuse
  VE-->>UI: { success, passId, qrCode? }

  AD->>FS: Reconcile payments vs passes
  AD->>/api/admin/fix-stuck-payment: POST {orderId}
  /api/admin/fix-stuck-payment->>CF: GET /orders/{orderId}
  /api/admin/fix-stuck-payment->>FS: Tx: create pass if none; else reuse
```

This diagram mirrors the concrete route handlers and Firestore operations described above.

