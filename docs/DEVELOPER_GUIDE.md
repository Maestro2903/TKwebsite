## 1. Overview

This guide is for developers working on the CIT Takshashila 2026 platform. It covers:

- Local setup and environment configuration
- Project structure and conventions
- Common development tasks
- Testing and debugging tips

For architecture and API details, refer to the other docs in `docs/` (especially `SYSTEM_OVERVIEW.md`, `FRONTEND_ARCHITECTURE.md`, and `BACKEND_API_REFERENCE.md`).

---

## 2. Prerequisites

- **Node.js**: v20 LTS (or compatible)
- **npm**: v10+
- **Firebase CLI**: `npm install -g firebase-tools`
- **Git**
- **Code editor**: VS Code (recommended) with:
  - TypeScript / ESLint support
  - Tailwind CSS IntelliSense (optional)

Accounts/services:

- Firebase project (dev/stage/prod as needed)
- Cashfree sandbox account
- Resend account (for email testing)

---

## 3. Getting Started

### 3.1 Clone & Install

```bash
git clone <repo-url> TKwebsite
cd TKwebsite

npm install
```

### 3.2 Environment Setup

1. Create `.env.local` in the project root.
2. Populate with values from your Firebase/Cashfree/Resend projects.

Example (sanitized):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cit-takshashila.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cit-takshashila-2026
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cit-takshashila-2026.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"cit-takshashila-2026", ...}

NEXT_PUBLIC_CASHFREE_APP_ID=CF_TEST_APP_ID
CASHFREE_SECRET_KEY=CF_TEST_SECRET
NEXT_PUBLIC_CASHFREE_ENV=sandbox

RESEND_API_KEY=re_test_...
QR_SECRET_KEY=some-long-random-string-change-me
```

> Never commit real `.env.local` values. Production values belong only in Vercel’s environment settings.

### 3.3 Initialize Firestore Collections

After configuring Firebase credentials:

```bash
npm run db:init
```

This seeds `_init_` documents in key collections to avoid “collection does not exist” quirks.

### 3.4 Run the Dev Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 4. Project Structure (Developer View)

High‑level:

```text
TKwebsite/
├── app/              # Next.js App Router (pages + API routes)
├── src/
│   ├── components/   # Layout, sections, UI, decorative
│   ├── contexts/     # React contexts (auth, loading)
│   ├── data/         # Static data/config (events, passes, shows, rules)
│   ├── features/     # Auth, payments, passes, email
│   ├── hooks/        # useLenis, useGSAP
│   ├── lib/          # Firebase clients, utilities, security helpers
│   └── types/        # Shared TypeScript types
├── styles/           # Global CSS
├── public/           # Static assets (images, fonts, video)
├── scripts/          # DB, users, testing, admin scripts
└── docs/             # Technical documentation
```

Path aliases (from `tsconfig.json`):

| Alias                | Resolves to              |
|----------------------|--------------------------|
| `@/*`                | project root             |
| `@/components/*`     | `src/components/*`       |
| `@/contexts/*`       | `src/contexts/*`         |
| `@/features/*`       | `src/features/*`         |
| `@/lib/*`            | `src/lib/*`              |
| `@/hooks/*`          | `src/hooks/*`            |
| `@/data/*`           | `src/data/*`             |
| `@/types/*`          | `src/types/*`            |
| `@/styles/*`         | `styles/*`               |

Use these aliases instead of long relative paths.

---

## 5. Development Workflow

### 5.1 Branching & Commits

Suggested (adapt to your team’s conventions):

- Branch names:
  - `feature/<short-description>`
  - `fix/<short-description>`
  - `chore/<short-description>`

- Commit messages:
  - `feat: add sana arena hero`
  - `fix: payment verify retry logic`
  - `docs: add database schema`

### 5.2 Code Style & Linting

- ESLint is configured via `eslint.config.mjs`.
- Run:

```bash
npm run lint
```

Fix issues as you go; aim for a clean lint state before merging.

### 5.3 Adding UI Components

Guidelines:

- Place reusable primitives under `src/components/ui/`.
- Place page‑specific sections under `src/components/sections/<domain>/`.
- Keep components:
  - Presentational where possible.
  - Separated from business logic (which lives in `features` or `lib`).

### 5.4 Adding API Routes

Place new API route under `app/api/<domain>/<name>/route.ts`, for example:

```text
app/api/analytics/track/route.ts
```

Guidelines:

- Use TypeScript with clear input/output types.
- Always:
  - Validate request body (ideally Zod).
  - Authenticate & authorize where needed.
  - Wrap logic in `try/catch` and return structured JSON errors.
  - Avoid leaking secrets in responses or logs.

Document new endpoints in `docs/BACKEND_API_REFERENCE.md`.

---

## 6. Common Tasks

### 6.1 Add a New Pass Type

1. Update config:
   - `src/data/passes.ts` – add new `RegistrationPass` entry.
2. Update pricing/business logic:
   - Payment creation logic in `/api/payment/create-order` to:
     - Recognize new `passType`.
     - Validate `amount` correctly.
3. Update UI:
   - Registration passes grid component to show the new option (if not already automatic).
4. Update docs:
   - `PAYMENT_WORKFLOW.md` (pricing table).
   - `DATABASE_SCHEMA.md` (if any new fields).

### 6.2 Create a New Page

1. Create folder under `app/`, e.g. `app/about/page.tsx`.
2. Use `ClientLayout`, `Navigation`, and `Footer`:

```tsx
'use client';

import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="page_main page_main--default">
        {/* content */}
      </main>
      <Footer />
    </>
  );
}
```

3. Add any new sections under `src/components/sections/about/`.

### 6.3 Modify Security Rules

1. Edit `firestore.rules`.
2. Test locally (if using Firebase Emulator) or deploy rules:

```bash
firebase deploy --only firestore:rules
```

3. Re‑run relevant flows (e.g. registration, scanning).

Document changes in:

- `DATABASE_SCHEMA.md` (rules summary).
- `AUTHENTICATION_AUTHORIZATION.md` (permission model).

---

## 7. Testing

There isn’t a formal automated test suite yet; testing is primarily via scripts and manual flows.

### 7.1 Manual UI Testing

Key flows to test:

- Anonymous → sign‑in → profile completion → pass selection → payment (sandbox) → success → “My Pass”.
- SaNa Arena / Proshows pages → sticky CTAs → registration.
- Organizer flows:
  - QR scanning and pass status updates.
  - Team member check‑in.

### 7.2 Scripts

From `package.json`:

| Script             | Purpose                          |
|--------------------|----------------------------------|
| `npm run test:email`   | Send a sample email with Resend      |
| `npm run test:pdf`     | Test server‑side PDF generation      |
| `npm run test:payment` | Simulate a full payment flow         |

Run them after making changes to:

- Email templates.
- PDF layout.
- Payment or pass logic.

### 7.3 Suggestions for Future Automated Tests

If you add automated tests, consider:

- **Unit tests**:
  - Validation helpers (Zod wrappers).
  - QR signing/verification logic.
  - Derived pricing for pass types.

- **Integration tests**:
  - Payment endpoint interactions with a mocked Cashfree client.
  - Pass creation and QR generation.

- **E2E tests**:
  - Cypress/Playwright to cover full “register → pay → pass” flows.

---

## 8. Debugging Tips

### 8.1 Frontend

- Use browser DevTools:
  - React DevTools to inspect component tree and context.
  - Network tab to see API requests and responses.

- Check:
  - `Authorization` header present and correct on protected API calls.
  - Responses from `/api/payment/create-order` and `/api/payment/verify`.

### 8.2 Backend

- Use Vercel logs:
  - Filter by route path (e.g. `/api/payment/create-order`).
  - Look for stack traces and error messages from `console.error`.

- Firebase:
  - Use Firestore console to inspect documents written by your code.

### 8.3 Data & Scripts

- Use DB scripts to inspect or clean up:
  - `npm run db:debug` – inspect collections.
  - `npm run db:clear` – only for dev environments.
  - `npm run users:find` – locate specific users.

---

## 9. Contribution Guidelines

Suggested conventions (adapt to your team’s needs):

1. **Before you start**
   - Read `SYSTEM_OVERVIEW.md` and `FRONTEND_ARCHITECTURE.md`.
   - Skim relevant docs for the part you’re changing (API, DB, auth).

2. **While you work**
   - Keep components focused and composable.
   - Avoid duplicating logic that belongs in `features/` or `lib/`.
   - Keep Firestore access pattern centralized in feature modules or API routes.

3. **Before pushing**
   - Run `npm run lint`.
   - Sanity‑check main flows in dev.
   - Update relevant docs under `docs/` when changing architecture or behavior.

4. **Pull Requests**
   - Clearly describe:
     - What changed.
     - Why it changed (link to issue/task if applicable).
     - How to test it (steps, test data).

---

## 10. References

Key documents for deeper context:

- `docs/SYSTEM_OVERVIEW.md`
- `docs/PROJECT-LAYOUT-AND-ARCHITECTURE.md`
- `docs/FRONTEND_ARCHITECTURE.md`
- `docs/BACKEND_API_REFERENCE.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/AUTHENTICATION_AUTHORIZATION.md`
- `docs/PAYMENT_WORKFLOW.md`
- `docs/PASS_QR_SYSTEM.md`
- `docs/EMAIL_SYSTEM.md`
- `docs/DEPLOYMENT_HOSTING.md`
- `docs/MAINTENANCE_OPERATIONS.md`
- `docs/SCALABILITY_PERFORMANCE.md`

Use this guide as a starting point; keep it updated as the system evolves.

