## Security Audit

This document provides a security-focused assessment of the TKwebsite application based strictly on repository code. It covers authentication, authorization, Firestore rules, QR and payment integrity, rate limiting, and production risks.

---

### 1. Authentication & Identity

#### Firebase Authentication

- **Client**:
  - Uses Firebase JS SDK from `src/lib/firebase/clientApp.ts`.
  - Google sign-in via `signInWithPopup` (or redirect) in `src/features/auth/authService.ts`.
- **Server**:
  - Firebase Admin initialized in `src/lib/firebase/adminApp.ts` using service account credentials from environment variables.
  - ID token verification via:

```ts
const auth = getAdminAuth();
const decoded = await auth.verifyIdToken(idToken);
```

#### Token Usage in APIs

Routes that require authentication:

- `/api/payment/create-order`
- `/api/users/profile` (GET & POST)
- `/api/users/passes`
- `/api/passes/[passId]`
- `/api/passes/qr`
- `/api/passes/scan`
- `/api/passes/scan-member`
- `/api/mock-summit/assign-country`

Common patterns:

- Tokens are extracted from `Authorization: Bearer <token>`.
- For `create-order`, expired tokens are explicitly detected (`auth/id-token-expired`) and surfaced to users as “Session expired. Please sign in again.”
- The `userId` passed in request bodies (e.g., to `create-order`) is cross-checked with `decoded.uid` to prevent privilege escalation by tampering with body fields.

**Assessment**: Identity verification is robust and consistently applied for state-changing routes. The cross-check between `decoded.uid` and `body.userId` in `create-order` is a strong defense-in-depth measure.

---

### 2. Firestore Rules vs Backend Logic

`firestore.rules` defines access control for several collections:

- `appUsers`
- `registrations`
- `passes`
- `teams`
- `payments`
- `mockSummitAccessCodes`

Key rules:

- `appUsers`:
  - Read: only self (`request.auth.uid == userId`).
  - Create:
    - Only self, *and* `isOrganizer` must be absent or `false`.
  - Update:
    - Only self, and cannot modify `isOrganizer`.
- `passes`:
  - Read:
    - Owner (`resource.data.userId == request.auth.uid`), or
    - Organizer (`appUsers/{uid}.isOrganizer == true`).
  - Create:
    - Denied for clients (`allow create: if false`).
  - Update:
    - Allowed only for organizers (again via `appUsers`).
  - Delete: denied.
- `teams`:
  - Read:
    - Team leader (`resource.data.leaderId == request.auth.uid`), or
    - Organizer (`appUsers/{uid}.isOrganizer == true`).
  - Create/delete:
    - Denied for clients.
  - Update:
    - Only organizers.
- `payments`:
  - Read:
    - Owner only (`resource.data.userId == request.auth.uid`).
  - Write:
    - Denied for clients.
- `mockSummitAccessCodes`:
  - All reads/writes denied for clients.

Collections such as `users`, `events`, and `mockSummitCountries` are accessed via the Admin SDK only; they are not exposed in client rules.

**Alignment with backend logic**:

- All writes to `payments`, `passes`, `teams`, and `mockSummitAccessCodes` are executed via Admin SDK in API routes, consistent with `allow create/update/delete: if false` rules.
- API routes that need to read or update `passes` or `teams` do so via Admin SDK (ignoring client-side rules), but **client apps** still respect the rules if they use SDK directly.
- Organizer checks in APIs use `users/{uid}.isOrganizer` read via Admin SDK, while Firestore rules use `appUsers/{uid}.isOrganizer`. This separation:
  - Prevents client users from editing `isOrganizer` in `appUsers`.
  - Allows the backend to manage organizer state centrally in `users` without exposing it directly.

**Assessment**: Firestore rules are tightly scoped and align well with how the backend accesses data. Critical write paths are server-only and cannot be reached from untrusted clients via the SDK.

---

### 3. Organizer Privilege Enforcement

Organizer privileges in code are enforced via:

- `users/{uid}.isOrganizer`:
  - Checked in:
    - `/api/passes/scan`
    - `/api/passes/scan-member`
    - `/api/passes/[passId]` and `/api/passes/qr` for reading passes belonging to other users.
  - Accessed via Admin SDK (not subject to client rules).

Client-facing representation:

- `appUsers.{isOrganizer}` (optional) is used for Firestore rules.
- `firestore.rules` ensure clients cannot grant themselves organizer status.

**Privilege surfaces**:

- Only organizer accounts can:
  - Scan passes and mark them as `used`.
  - Check in team members.
  - Update `teams` and `passes` via client SDK (per `firestore.rules`).
  - Access non-owned passes and teams in Firestore.

**Assessment**: Organizer privileges are enforced server-side and reinforced by Firestore rules. The primary risk lies in how `users/{uid}.isOrganizer` is assigned (outside this code), not in how it is enforced here.

---

### 4. QR Forgery & Replay Resilience

#### Cryptographic Design

- **Signed tokens**:
  - HMAC-SHA256 with secret `QR_SECRET_KEY`.
  - Token format: `passId:expiry.signature`.
  - `verifySignedQR` validates format, expiry, and signature.
  - Used for:
    - Webhook-generated passes.
    - Dynamic regeneration via `/api/passes/qr`.

- **Encrypted payloads**:
  - AES-256-CBC with `QR_ENCRYPTION_KEY` (32-char key).
  - Encrypted data: `ivHex:cipherHex`.
  - Decrypted JSON includes:
    - `id` (passId).
    - `name` or `teamName`.
    - `members` (for group passes).
    - `events` and `days`.
  - Used by:
    - `/api/payment/verify`.
    - `/api/admin/fix-stuck-payment`.

#### Scan Validation

The scan endpoint first attempts to validate signed tokens; if that fails, it falls back to encrypted payloads:

- Signed token path:
  - Strong HMAC check and expiry.
- Encrypted payload path:
  - Decrypts and uses `id` as passId; does not rely on any other fields inside the decrypted object.

Regardless of payload type:

- After retrieving `passId`, the endpoint:
  - Loads `passes/{passId}`.
  - Ensures it exists.
  - Ensures `usedAt` is not already set.
  - Marks the pass as used and records `scannedBy`.

#### Replay Attacks

- Once a pass is scanned successfully:
  - `status` changes to `'used'`.
  - `usedAt` is set.
  - Subsequent scans receive a `409` response, preventing repeated entry.
- Signed tokens have an embedded expiry; even if `status` were not checked, the token itself would eventually be invalid.
- Encrypted payloads rely exclusively on the pass document state for anti-replay.

**Assessment**:

- Forging a valid signed token or encrypted payload without secrets is infeasible.
- Replay is effectively blocked via `usedAt` checks plus token expiry for signed tokens.
- The fallback to encrypted-only path is still safe, as it only exposes the pass id and always consults server state.

---

### 5. Payment Tampering Prevention

Payment integrity is enforced at multiple stages:

#### 5.1 Create-order Validation

Before any call to Cashfree:

- `passType` is validated against a canonical set (`PASS_TYPES`).
- `amount` is re-computed on the server from:
  - `passType` pricing.
  - `teamMemberCount`.
  - `selectedDays.length`.
- `selectedEvents` are validated using the canonical `events` collection:
  - Existence and `isActive`.
  - Event type and min/max team size for `group_events`.
  - Allowed pass types for each event.
  - Date constraints for `day_pass` and `proshow`.
  - Mock summit exclusivity.
- Mock summit access codes and country assignments are strictly validated server-side and updated with `FieldValue.increment`.

This prevents:

- Underpaying by modifying amounts on the client.
- Selecting events not allowed for a given pass.
- Circumventing mock summit constraints (country assignment and limited-use codes).

#### 5.2 Cashfree Status Verification

- Webhook:
  - Processes only `PAYMENT_SUCCESS_WEBHOOK` events.
  - Validates HMAC signature with both webhook and API secrets.
  - Treats missing/invalid signatures as `401`.
- Verify endpoint:
  - Polls Cashfree for `order_status`:
    - Requires `order_status === 'PAID'`.
    - If not `PAID`, returns `400` instructing users to retry later.
- Admin fix:
  - Also checks Cashfree order status for `PAID` before creating passes when `payments.status` is not success.

The system does not rely on client-supplied status flags; all statuses are driven by Cashfree responses and internal payment records.

#### 5.3 Pass Creation Coupled to Payment

- `passes.paymentId` links directly to `payments.cashfreeOrderId`.
- All pass-creation paths:
  - Use payment details for `userId`, `passType`, `amount`, `selectedEvents`, `selectedDays`.
  - Reject pass creation when payment records are invalid or incomplete.

**Assessment**:

- Client-side tampering with amounts or event selections is mitigated by robust server-side re-validation.
- Webhook signature validation and REST polling with API secrets ensure only genuine, successful payments result in passes.

---

### 6. Rate Limiting & Abuse Potential

Rate limiting is implemented as an in-memory, per-instance mechanism:

- Protected endpoints:
  - `/api/payment/create-order`: 5/min/IP.
  - `/api/payment/verify`: 10/min/IP.
  - `/api/users/profile` (POST): 5/min/IP.
  - `/api/passes/scan`: 10/min/IP.
  - `/api/passes/scan-member`: 20/min/IP.

**Strengths**:

- Prevents burst abuse on a single instance (e.g., brute-force scanning, order creation spamming).

**Limitations**:

- In a horizontally scaled, multi-instance environment:
  - Each instance maintains its own rate-limiter store.
  - Attackers could circumvent per-instance limits by hitting multiple instances.

**Assessment**:

- Adequate as a **local throttle** but not a full distributed rate-limiting solution.
- For production at scale, a centralized store (e.g., Redis, Upstash) should replace the in-memory store.

---

### 7. Other Notable Security Controls

#### Cashfree Webhook Secret Fallback

- The webhook verifies both a dedicated webhook secret and the PG/API secret.
- This flexibility helps compatibility with different Cashfree configurations but:
  - Slightly expands the attack surface in the event one of the secrets leaks.

Mitigation:

- Both secrets must be stored securely; if possible, use a dedicated webhook secret and avoid sharing PG secret across services.

#### Input Sanitization for Profiles

- `src/lib/security/validation.ts` uses zod and custom regex checks to:
  - Enforce:
    - Name characters and length.
    - College name constraints (no `<`, `>`, `script`, `javascript:`, or `on*=` patterns).
    - Phone format (10-digit Indian numbers).
  - `sanitizeInput` removes:
    - `<`, `>`, `javascript:`, and inline event handler patterns.

This reduces the risk of XSS from profile fields rendered anywhere in HTML or PDFs.

#### Middleware & SEO

- `middleware.ts`:
  - Adds `X-Robots-Tag: noindex, nofollow` to responses when the host contains `takshashila26.vercel.app`.
  - Prevents the Vercel domain from being indexed, avoiding duplication and branding confusion.

---

### 8. Production Risk Analysis & Recommendations

Based solely on current implementation, the following risks and mitigations are identified:

#### 8.1 Unauthenticated Admin Routes

- Risk:
  - `/api/admin/reconcile-payments` and `/api/admin/fix-stuck-payment` have no in-code authorization.
  - If deployed publicly without infra protections, an attacker could:
    - Enumerate payments and passes.
    - Trigger pass issuance for arbitrary orders, possibly leaking pass data.
- Recommendation:
  - Add explicit auth:
    - Require an admin-only ID token and `isOrganizer` flag with an additional role field, **or**
    - Use a separate admin auth mechanism (e.g., service accounts, signed admin tokens).
  - At minimum, ensure:
    - Routes are accessible only from trusted networks (VPN, IP allowlist).

#### 8.2 In-memory Rate Limiting Under Scale

- Risk:
  - With multiple serverless instances:
    - IP-based counters are not shared.
    - Attackers could circumvent limits by spreading traffic across instances.
  - Could enable brute-force scanning attempts or repeated create-order calls.
- Recommendation:
  - Replace in-memory store with:
    - A distributed store (e.g., Redis, Upstash) keyed by IP and path.
  - Optionally:
    - Add user-level limits keyed by `uid` for authenticated endpoints.

#### 8.3 Error Disclosure via Verify Endpoint

- `/api/payment/verify`:
  - Returns detailed error information, including:
    - Surprise `details` fields with stack traces in 500 errors.
  - While helpful for debugging, this can:
    - Reveal internal paths, stack traces, or environment hints.
- Recommendation:
  - In production:
    - Return generic error messages to clients.
    - Log details server-side only.

#### 8.4 Email & Attachment Behavior

- Risk:
  - If `RESEND_API_KEY` is misconfigured:
    - System logs warnings and disables email sending, but users may not receive passes.
  - PDFs are generated with user-provided data; while sanitized, continued vigilance is needed to avoid injection in PDF viewers.
- Recommendation:
  - Add health checks or monitoring to ensure email dispatch is functioning.
  - Consider minimal HTML/markup in PDFs to limit any potential rendering quirks.

#### 8.5 Organizer Role Management

- Risk:
  - How `users/{uid}.isOrganizer` is set is not in this repo.
  - Misconfiguration or manual errors could grant unintended users organizer privileges.
  - Organizer status grants:
    - Full read access to passes and teams (via rules).
    - Ability to mark passes as used and members as checked in.
- Recommendation:
  - Manage organizer assignments via a secure admin workflow:
    - Backed by audits.
    - Restricted to a minimal set of trusted accounts.
  - Maintain logs of organizer changes for investigation.

---

### 9. Summary

From a security perspective, the TKwebsite app:

- Uses Firebase Authentication and Admin SDK correctly for identity and server-side authorization checks.
- Applies strong Firestore rules to protect client-side data access.
- Implements robust payment validation, webhook signature checks, and idempotent pass creation.
- Protects against QR forgery and replay via HMAC signing, encryption, and pass state checks.

Primary hardening areas for a production environment:

- Add in-app authorization for admin APIs (`/api/admin/**`) instead of relying solely on infrastructure controls.
- Replace in-memory rate limiting with a distributed alternative.
- Relax client-facing error detail for critical routes like `/api/payment/verify`.
- Formalize organizer role management and monitoring.

The core architecture provides a solid foundation, and with these hardening steps, it can operate securely at production scale.

