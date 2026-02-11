## Frequently Asked Questions

### 1. What does this system do?

It is a full‑stack web platform for **CIT Takshashila 2026**, handling event discovery, registration, online payments, QR‑based passes, and organizer tools for entry and attendance.

---

### 2. Which technologies does it use?

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, GSAP, Framer Motion, Lenis.
- **Backend:** Next.js API routes on Vercel, Firebase Admin SDK.
- **Data:** Firebase Firestore.
- **Auth:** Firebase Authentication (Google).
- **Payments:** Cashfree.
- **Email:** Resend.

See `SYSTEM_OVERVIEW.md` and `FRONTEND_ARCHITECTURE.md` for details.

---

### 3. Where are user accounts stored?

- Authentication identities (UIDs) are managed by **Firebase Auth**.
- User profiles (name, college, phone, `isOrganizer`) are stored in Firestore under `users/{uid}`.

---

### 4. How are payments verified?

Payments are verified in two ways:

1. **Cashfree webhook** (`/api/webhooks/cashfree`) confirms payment and creates passes.
2. **Client verify call** (`/api/payment/verify`) double‑checks status by querying Cashfree when the user returns to the app.

Both paths are idempotent and ensure a single pass per order. See `PAYMENT_WORKFLOW.md`.

---

### 5. How are QR codes secured?

- Each QR encodes a **signed token** (`passId:exp.signature`).
- Signature is generated using `QR_SECRET_KEY` and HMAC‑SHA256.
- On scan:
  - Signature is recomputed and compared.
  - Expiry (`exp`) is checked.
  - Pass status and ownership are validated.

Details are in `PASS_QR_SYSTEM.md`.

---

### 6. Can normal users modify their role to become organizers?

No.

- Firestore rules prevent changes to `isOrganizer` by clients.
- Only admins can update this flag via Admin SDK or Firebase console.

See `AUTHENTICATION_AUTHORIZATION.md`.

---

### 7. What happens if an email fails to send?

- Payment and pass creation are not affected.
- The system logs the failure in server logs.
- Users can always access their passes from `/register/my-pass`.

Email behavior is detailed in `EMAIL_SYSTEM.md`.

---

### 8. How do I run the project locally?

1. Install Node.js 20 and npm 10.
2. Clone the repo and run `npm install`.
3. Create `.env.local` with Firebase, Cashfree, Resend, and QR secrets.
4. Initialize Firestore collections with `npm run db:init`.
5. Start dev server: `npm run dev` and visit `http://localhost:3000`.

See `DEVELOPER_GUIDE.md` for a full walkthrough.

---

### 9. How do I deploy changes?

1. Push your branch to GitHub.
2. Vercel builds a preview deployment automatically.
3. After review, merge to `main` to trigger production deployment.
4. If Firestore rules/indexes changed, run `firebase deploy --only firestore:rules` (and/or `:indexes`).

Deployment details are in `DEPLOYMENT_HOSTING.md`.

---

### 10. How do I debug a stuck payment?

1. Check `payments/{orderId}` in Firestore.
2. Confirm payment status on Cashfree dashboard.
3. Use:
   - `/api/payment/verify` endpoint, or
   - `/api/admin/fix-stuck-payment` (admin‑only) to reconcile.

See `PAYMENT_WORKFLOW.md` and `MAINTENANCE_OPERATIONS.md`.

---

### 11. How are group events handled?

- Group event data is stored in `teams/{teamId}`.
- A single group pass is issued for the team with an embedded `teamSnapshot`.
- Organizers check in each member individually via `/api/passes/scan-member`.

See `DATABASE_SCHEMA.md` and `PASS_QR_SYSTEM.md`.

---

### 12. Where should I start when modifying the system?

- For UI changes: `FRONTEND_ARCHITECTURE.md` + `src/components/**`.
- For APIs: `BACKEND_API_REFERENCE.md` + `app/api/**`.
- For data model: `DATABASE_SCHEMA.md`.
- For auth/security: `AUTHENTICATION_AUTHORIZATION.md`.
- For overall mental model: `SYSTEM_OVERVIEW.md`.

