## Changelog

### Unversioned Documentation Pass (2026-02-11)

- Added a complete technical documentation suite under `docs/`:
  - `SYSTEM_OVERVIEW.md`
  - `FRONTEND_ARCHITECTURE.md`
  - `BACKEND_API_REFERENCE.md`
  - `DATABASE_SCHEMA.md`
  - `AUTHENTICATION_AUTHORIZATION.md`
  - `PAYMENT_WORKFLOW.md`
  - `PASS_QR_SYSTEM.md`
  - `EMAIL_SYSTEM.md`
  - `DEPLOYMENT_HOSTING.md`
  - `MAINTENANCE_OPERATIONS.md`
  - `SCALABILITY_PERFORMANCE.md`
  - `DEVELOPER_GUIDE.md`
  - `GLOSSARY.md`
  - `FAQ.md`

- Updated documentation structure to reflect:
  - Next.js 16 App Router usage.
  - Firestore collections (`users`, `payments`, `passes`, `teams`, legacy `registrations`).
  - Cashfree payment integration and webhook flows.
  - Resend email integration with QR/PDF passes.

- Clarified:
  - Authentication and role model (user vs organizer).
  - QR signing and scan workflows.
  - Deployment setup for Vercel + Firebase.

Future versions should add dated entries here whenever:

- New features are shipped.
- Breaking changes are introduced.
- Architecture or data model is significantly altered.

