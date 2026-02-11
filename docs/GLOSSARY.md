## Glossary

### A

- **API Route**: A serverless HTTP endpoint implemented under `app/api/**` in Next.js. Used as the backend for this app.

- **AuthContext**: React context (`src/features/auth/AuthContext.tsx`) that exposes auth state (`user`, `userData`, `loading`) and actions (`signIn`, `signOut`, `updateUserProfile`).

### C

- **Cashfree**: The payment gateway used to process online payments for passes. Integrates via REST API, JS SDK, and webhooks.

- **Client SDK (Firebase)**: Firebase JS SDK used in the browser for user sign‑in and, in some cases, Firestore reads/writes.

### D

- **Data URL**: A string that embeds file data directly in the URL, e.g. `data:image/png;base64,...`. Used to store QR images in `passes.qrCode`.

### F

- **Firestore**: NoSQL document database used for all persistent data (users, payments, passes, teams).

- **Firestore Rules**: Security rules that govern which authenticated users can read/write which documents.

### I

- **ID Token**: Short‑lived JWT issued by Firebase Auth after user sign‑in, used as `Authorization: Bearer <token>` for API authentication.

### M

- **Modal Checkout**: Cashfree payment UI that opens in a popup/modal instead of redirecting the browser.

### O

- **Organizer**: A special user role (`isOrganizer: true` on `users/{uid}`) allowed to scan passes and manage team attendance.

### P

- **Pass**: A Firestore document under `passes/{passId}` representing a purchased right to attend the fest or proshows. Includes QR code, status (`paid` / `used`), and references to payment/team.

- **Pass Type**: Categorical type for a pass such as `day_pass`, `group_events`, `proshow`, `sana_concert`.

### Q

- **QR Code**: 2D barcode encoding a signed token for a pass. Generated on the server and scanned at entry to validate and mark passes as used.

- **QR Secret (`QR_SECRET_KEY`)**: Environment variable used to sign QR payloads with HMAC‑SHA256.

### R

- **Rate Limiter**: In‑memory mechanism that caps how many times certain endpoints can be called per IP in a given time window.

- **Resend**: Transactional email service used to send confirmation emails with QR codes and PDF passes.

### S

- **Serverless Function**: Compute unit deployed by Vercel for each API route. Scales automatically based on demand.

### T

- **Team**: Document in `teams/{teamId}` representing a group event registration with leader info, members, and attendance.

- **Team Snapshot**: Embedded summary of team info saved inside a pass at payment time so pass data does not change when team is edited later.

### V

- **Vercel**: Hosting provider for the Next.js app and its API routes, providing global CDN and automatic deployments.

