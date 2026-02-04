# Backend

Server-side logic and shared data for the Takshashila 26 website.

- **`lib/`** – Core libraries and utilities
  - Firebase (client & admin), auth, Cashfree integration
  - Types, event/show data, registration config
  - Firestore types and helpers

API routes live in `app/api/` (Next.js requirement) and import from `@/lib/*` (resolves to `backend/lib/`).
