## 1. Overview

This document describes how to **operate, monitor, and maintain** the CIT Takshashila 2026 system in production:

- Monitoring & logging
- Error handling and troubleshooting
- Database maintenance
- Operational scripts and admin tools

---

## 2. Monitoring & Observability

### 2.1 Vercel

- **Logs**
  - All `console.log`, `console.warn`, and `console.error` from:
    - API routes in `app/api/**`
    - Server components
  - Accessible via Vercel → Project → Logs.
  - Critical paths log:
    - Payment creation and verification results.
    - Webhook events and validation errors.
    - Email sending successes/failures.

- **Analytics (optional)**
  - Vercel Analytics can be enabled to monitor:
    - Page load times.
    - Core Web Vitals.
    - Page view counts.

### 2.2 Firebase Console

- **Authentication**
  - Monitor sign‑in activity, user counts, and provider status.

- **Firestore**
  - Usage dashboards:
    - Read/write counts.
    - Document counts per collection.
  - Indexes:
    - Check for “index required” errors.
  - Data viewer:
    - Inspect documents in `users`, `payments`, `passes`, `teams`.

### 2.3 Cashfree Dashboard

- Monitor:
  - Live payment attempts and success rates.
  - Webhook delivery logs (if provided).
  - Settlement reports and transaction exports.

### 2.4 Resend Dashboard

- Track:
  - Sent emails, deliveries, bounces, and spam reports.
  - Template previews and logs for debugging email content.

---

## 3. Logging & Error Handling

### 3.1 API Error Strategy

Common pattern:

```ts
try {
  // business logic
} catch (error: unknown) {
  console.error('Context message', error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Internal server error' },
    { status: 500 },
  );
}
```

Key points:

- Each route logs enough context to diagnose failures (e.g. `orderId`, pass/team IDs).
- Sensitive values (secrets, token strings) are **not** logged.

### 3.2 HTTP Status Conventions

- `400` – validation errors, missing or malformed payloads.
- `401` – auth failures (missing/invalid ID token, invalid webhook signature).
- `403` – forbidden (not owner/organizer).
- `404` – resource not found (pass, payment, team, member).
- `409` – conflict (pass already used, member already checked in).
- `429` – rate limited.
- `500` – unexpected server errors (network failures, Cashfree/Resend downtime).

### 3.3 Frontend Error Handling

- Registration and payment pages show:
  - Inline validation messages for user errors.
  - Toasts or alerts for server or network failures.
- Auth errors (failed Google sign‑in) are surfaced via `AuthContext` with user‑friendly text.

---

## 4. Database Maintenance

### 4.1 Initialization

Script: `scripts/db/init-collections.js`

Purpose:

- Create minimal `_init_` documents in key collections to ensure Firestore collections exist.
  - `passes/_init_`
  - `teams/_init_`
  - `payments/_init_`
  - `registrations/_init_`

Run:

```bash
npm run db:init
```

Recommended:

- Run once per environment (dev, staging, prod) after setting up Firebase.

### 4.2 Clearing Data (Development Only)

Script: `scripts/db/clear-database.js`

Purpose:

- Delete documents from collections in a development/sandbox environment.

Run:

```bash
npm run db:clear
```

**Warning:**  
Do **not** run in production; this is destructive.

### 4.3 Debugging Collections

Script: `scripts/db/debug-collections.js`

Purpose:

- Inspect and print high‑level stats and sample documents from:
  - `users`
  - `payments`
  - `passes`
  - `teams`

Useful when:

- Investigating inconsistent data or stuck states.

---

## 5. User & Payment Utilities

### 5.1 User Management

Located under `scripts/users/`:

- `list-users.js`
  - Lists all users (from Firebase Auth and/or `users` collection).

- `find-user.js`
  - Find a user by email or phone and print details.

- `dump-users.js`
  - Export user data to a file (e.g. for analytics or backup).

Run via npm:

```bash
npm run users:list
npm run users:find
npm run users:dump
```

### 5.2 Payment Debugging

Typical utilities (may vary slightly by file name, refer to `scripts/db/`):

- **Inspect a payment**
  - Prints details of a payment by `orderId` and linked pass/team.

- **Manual verify payment**
  - Re‑checks Cashfree and, if paid, creates a pass (similar to admin fix endpoint).

- **List recent payments**
  - Summaries of latest N payments for quick review.

These are used when:

- Debugging payment issues.
- Reconciling with Cashfree dashboard.

---

## 6. Admin Operations

### 6.1 Fixing Stuck Payments

Endpoint: `POST /api/admin/fix-stuck-payment`

- Input: `{ "orderId": "order_..." }`
- Behavior:
  - Fetch `payments/{orderId}`.
  - Call Cashfree orders API to confirm payment status.
  - If `success`:
    - Update payment status.
    - Create pass if missing.
    - Trigger email sending.

Operational notes:

- **No built‑in auth** – must be restricted:
  - Use IP allow‑listing (only from admin network/VPN).
  - Expose only via internal tooling.
- Use **sparingly**:
  - Primarily for reconciliation when webhook or verify flows failed.

### 6.2 Granting Organizer Role

To mark a user as organizer:

1. Find user (`uid`) via:
   - Firebase Console → Authentication, or
   - `npm run users:find`.
2. Update `users/{uid}` document:
   - Set `isOrganizer = true`.
3. Organizers can now:
   - Scan passes.
   - Check in team members.

Remember:

- Clients cannot set `isOrganizer` themselves; only admins change this via Admin SDK or console.

---

## 7. Testing & QA

### 7.1 Email

Script: `npm run test:email`

- Ensures `RESEND_API_KEY` is valid.
- Confirms that test emails can be sent successfully.

### 7.2 PDF Generation

Script: `npm run test:pdf`

- Tests server‑side PDF generation for passes.
- Useful when changing pass layout or upgrading PDF libraries.

### 7.3 Payment Flow Simulation

Script: `npm run test:payment`

- Simulates a paid flow using sandbox Cashfree.
- Validates end‑to‑end:
  - Payment initiation,
  - Webhook/verify logic,
  - Pass creation,
  - Email sending.

---

## 8. Backup & Data Safety

### 8.1 Firestore Backups

Recommended practices:

- Enable Firestore managed backups (via Firebase console or GCP console).
- Periodically export critical collections:
  - `users`
  - `payments`
  - `passes`
  - `teams`

Backups can be:

- Triggered manually via GCP’s export/import tools.
- Scheduled via Cloud Scheduler + Cloud Functions (if configured outside this repo).

### 8.2 Manual Exports

Use `dump-users.js` and similar scripts to create CSV/JSON snapshots:

- Store securely (e.g. in GCS buckets or encrypted storage).
- Use for analytics and “what if” analysis without touching live DB.

---

## 9. Common Issues & Remedies

### 9.1 User Cannot See Their Pass

Symptoms:

- User reports successful payment, but `/register/my-pass` shows no passes.

Checklist:

1. Check **payments**:
   - In Firestore, confirm `payments/{orderId}` exists.
   - Confirm `status` is `success`; if not:
     - Use `/api/payment/verify` (if you have `orderId`).
     - Or use admin endpoint `/api/admin/fix-stuck-payment`.
2. Check **passes**:
   - Query by `paymentId` and `userId`.
   - Ensure a pass exists and `userId` matches.
3. If data is correct but UI still empty:
   - Check browser console/network tab for errors.
   - Ensure Firestore rules haven’t been modified to block reads.

### 9.2 QR Scan Fails

Symptoms:

- Scanner reports invalid token, expired QR, or cannot find pass.

Checklist:

1. Verify `QR_SECRET_KEY`:
   - Confirm value matches across:
     - Environment for pass generation.
     - Environment for scanning.
2. Check time/expiry:
   - Ensure server clocks are consistent.
3. Confirm pass exists:
   - Validate `passes/{passId}` is present for scanned QR’s `passId`.
4. Check organizer role:
   - Ensure scanning user has `isOrganizer === true`.

### 9.3 Email Not Received

Checklist:

1. Verify `RESEND_API_KEY` in environment.
2. Check Resend dashboard:
   - See if the email appears with success, bounce, or spam status.
3. Confirm recipient email address:
   - Look at `users/{uid}.email` and email logs.
4. Fallback:
   - Pass is still visible in `/register/my-pass`, even if email failed.

### 9.4 Rate Limiting Triggered

Symptoms:

- API returns `429 Too Many Requests`.

Checklist:

1. Confirm if the client retried rapidly (e.g. user double‑clicking or buggy UI).
2. For testing:
   - Wait for the configured window (60 seconds) and try again.
3. If triggered unexpectedly in production:
   - Consider whether a shared IP (e.g. campus Wi‑Fi) is issuing many requests.
   - For long‑term, consider migrating rate limits to a distributed store (e.g. Redis).

---

## 10. Future Operations Enhancements

Potential improvements:

- Integrate an error tracking tool (e.g. Sentry) for:
  - Aggregated API errors with stack traces.
  - Frontend error monitoring.

- Add monitoring/alerting:
  - Alerts on high error rates or webhook failures.
  - Dashboards for payments vs passes created.

- Implement more structured logging:
  - Log JSON payloads with request IDs.
  - Correlate logs across API calls.

---

## 11. Summary

- Daily operations revolve around:
  - Monitoring Vercel, Firebase, Cashfree, and Resend dashboards.
  - Using scripts to inspect and maintain Firestore data.
  - Handling edge cases like stuck payments or missing emails with admin tools.
- The system is designed so that:
  - Most common failures are recoverable (verify/admin flows).
  - Users can always access passes via the app, even if emails fail.

For scalability and performance considerations, see `SCALABILITY_PERFORMANCE.md`. For developer workflows, see `DEVELOPER_GUIDE.md`.

