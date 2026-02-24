## Admin & Organizer Architecture

This document describes how organizer and admin capabilities are exposed in the TKwebsite codebase.

There is **no dedicated admin dashboard UI** implemented under `app/**` or `src/components/**`. Instead, privileged operations are provided via:

- Organizer-only backend APIs used by external tools (e.g., scanner apps).
- Admin-only utilities under `app/api/admin/**`, intended to be protected at the infrastructure level.

All details are based on actual code in this repository.

---

### Scope Clarification

- There is **no admin web interface** such as:
  - `/admin` pages.
  - Admin React components under `src/components/**`.
- Administrative and organizer functions are realized through:
  - Role-checked APIs that:
    - Require a Firebase ID token.
    - Verify the caller’s organizer status via `users/{uid}.isOrganizer`.
  - Firestore rules that secure server-side data.
  - Admin reconciliation/repair endpoints under `app/api/admin/**` (no in-app auth; rely on external protections).

For the purposes of this document:

- **Organizer**: A user with `isOrganizer === true` in the `users` collection (and indirectly referenced via `appUsers` rules).
- **Admin / Operator**: A system or person with infrastructure-level access allowed to call `/api/admin/**` routes.

---

### Organizer Capabilities

Organizer capabilities are primarily centered around pass validation and attendance tracking for group events.

#### Pass Scanning

**Endpoint**: `POST /api/passes/scan`

- **Auth**:
  - Requires `Authorization: Bearer <ID_TOKEN>`.
  - Uses `getAdminAuth().verifyIdToken`.
- **Role check**:
  - Fetches `users/{uid}` and requires `isOrganizer === true`.
- **Functionality**:
  - Decodes QR data (signed token or encrypted payload) to derive `passId`.
  - Fetches `passes/{passId}`.
  - If already used:
    - Returns `409` with `usedAt`.
  - Else:
    - Updates pass:
      - `status: 'used'`
      - `usedAt: new Date()`
      - `scannedBy: uid`
    - Returns success and summary.
- **Use**:
  - Intended for a **separate scanner client** (web, mobile) that calls this endpoint with the scanned QR data and an organizer token.

#### Team Member Check-in

**Endpoint**: `POST /api/passes/scan-member`

- **Auth**:
  - Same as `/api/passes/scan`; organizer-only.
- **Functionality**:
  - Accepts `teamId` and `memberId`.
  - Reads `teams/{teamId}` and locates the member.
  - If already `checkedIn`:
    - Responds `409` with check-in timestamp.
  - Otherwise:
    - Updates that team member’s `attendance` structure via `arrayRemove`/`arrayUnion`:
      - `checkedIn: true`.
      - `checkInTime: serverTimestamp`.
      - `checkedInBy: organizerUid`.

This allows organizers to track individual attendance at group events, separate from general pass usage.

#### Accessing Passes and Teams

Authorization to read underlying Firestore documents is enforced by `firestore.rules`:

- `passes`:
  - Read allowed if:
    - `resource.data.userId == request.auth.uid`, or
    - `appUsers/{uid}.isOrganizer == true`.
  - This means organizers can:
    - Inspect passes for any user.
    - Build views over pass data, if a separate admin UI is implemented.
- `teams`:
  - Read allowed if:
    - `resource.data.leaderId == request.auth.uid`, or
    - `appUsers/{uid}.isOrganizer == true`.
  - Update allowed only for organizers.

Together, these rules support:

- Organizer-side tooling (scanner apps, dashboards) that read from Firestore via Firebase client SDK.
- Secure separation: regular users cannot read or mutate others’ passes or team data.

---

### Admin APIs (`/api/admin/**`)

Admin endpoints are designed for **operational and support tasks**, not general user access. They have no application-level auth checks; the expectation is that they are restricted by:

- Network controls (VPN, IP allowlists).
- Secret URLs or internal tooling.

#### Reconcile Payments

**Endpoint**: `GET /api/admin/reconcile-payments`

- **Functionality**:
  - Reads:
    - All `payments`.
    - All `passes`.
  - Computes:
    - Payments that already have corresponding passes (`withPass`).
    - Payments without passes (`withoutPass`).
  - For entries in `withoutPass`:
    - Provides a `callbackUrl` (e.g., `https://cittakshashila.org/payment/callback?order_id=...`) for user self-serve verification.
  - With `?fix=1`:
    - Iterates `withoutPass` items where `status === 'success'`.
    - For each, issues `POST /api/admin/fix-stuck-payment` to repair the missing pass and aggregates results.

- **Use cases**:
  - Identify stuck or incomplete pass issuance.
  - Batch repair known issues after an incident (e.g., webhook downtime).

#### Fix Stuck Payment

**Endpoint**: `POST /api/admin/fix-stuck-payment`

- **Input**:
  - `{ orderId: string }`.
- **Functionality**:
  1. Find the payment by `payments/{orderId}` or by `cashfreeOrderId`.
  2. If payment status is not `success`:
     - Poll Cashfree `/orders/{orderId}` to check `order_status`.
     - If `PAID`, update payment to `status: 'success'`.
  3. Compute event access based on `payments.selectedEvents`.
  4. Use a transaction to:
     - Check if there is an existing `passes` doc with `paymentId == orderId`.
     - If none:
       - Fetch `users/{userId}`.
       - Optionally fetch `teams/{teamId}`.
       - Build encrypted QR payload (name/team, events, days).
       - Create `passes/{passId}` with `teamSnapshot` and event access.
       - Update `teams/{teamId}` with `passId`, `paymentStatus: 'success'`, `updatedAt`.
  5. Send pass confirmation email with PDF using `generatePassPDFBuffer` and `sendEmail`.

- **Use cases**:
  - Manual repair of specific orders that failed to get passes due to transient issues.

---

### Data Queries & Filtering from an Admin Perspective

Even without a frontend admin dashboard, the codebase supports robust admin querying via:

- Firestore directly (Admin SDK / Firebase console):
  - `payments` collection:
    - Filter by `status`, `passType`, or `cashfreeOrderId`.
  - `passes` collection:
    - Filter by `userId`, `status`, or `paymentId`.
  - `teams` collection:
    - Filter by `leaderId`, `passId`, or `paymentStatus`.
  - `mockSummitCountries` and `mockSummitAccessCodes`:
    - Manage allocations and access codes.
- Admin APIs:
  - `reconcile-payments`:
    - Batch view of which `payments` have no `passes`.
  - `fix-stuck-payment`:
    - Single-item repair endpoint for automation or manual tools.

These building blocks can be used to construct a UI (internal tool) without changing backend behavior.

---

### Security & Performance Considerations

#### Security

- **Organizer Role**:
  - Determined from `users/{uid}.isOrganizer`.
  - `appUsers` rules ensure clients cannot escalate their own `isOrganizer` flag.
  - API routes that gate behavior (scan/scan-member/QR) rely on `users` collection for role checks.
- **Admin Routes**:
  - `/api/admin/reconcile-payments` and `/api/admin/fix-stuck-payment` have no in-code auth:
    - They must be protected by deployment configuration (e.g., IP restrictions or restricted environments).
  - These routes access all payments and passes; misuse could lead to data exposure.

#### Performance

- **Reconciliation**:
  - Scans full `payments` and `passes` collections; intended for occasional use.
  - On large datasets, running `?fix=1` may call many `fix-stuck-payment` operations.
- **Scan APIs**:
  - Per-request cost is small:
    - A few document reads and one update.
  - Rate limiting for scan/scan-member protects from brute-force abuse.

---

### Where a Future Admin Dashboard Would Hook In

A hypothetical admin dashboard could be built on top of this backend with:

- **For organizers**:
  - Client-side Firebase SDK querying `passes` and `teams` (subject to Firestore rules).
  - UI components for:
    - Listing passes by status.
    - Viewing team structures and attendance.
    - Triggering scans via web-based scanner UI that calls `/api/passes/scan` and `/api/passes/scan-member`.

- **For operators**:
  - UI pages that:
    - Call `/api/admin/reconcile-payments` to display mismatches.
    - Allow manual or bulk invocations of `/api/admin/fix-stuck-payment`.
  - These would be served under restricted routes (e.g., `/internal/admin`) and protected by separate auth (e.g., Auth0, IP allowlists, or SSO) layered on top of existing APIs.

The current backend has all necessary primitives; only a front-end and infra-level access controls are missing for a full in-app admin experience.

