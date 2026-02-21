## 1. Overview

The CIT Takshashila 2026 platform is deployed as:

- A **Next.js 16** application (App Router) hosted on **Vercel** (frontend + API routes).
- A **Firebase** project providing:
  - **Firestore** (database)
  - **Firebase Authentication** (Google sign‑in)

This document describes:

- Hosting architecture
- Build and deployment process
- Environment variables and configuration
- CI/CD behavior

---

## 2. Hosting Architecture

### 2.1 Vercel (Next.js App + API Routes)

- Hosts the entire Next.js app under:
  - `app/` (pages and API routes)
  - `public/` (static assets)
- API routes in `app/api/**` are deployed as **serverless functions**.
- Runtime:
  - Node.js on Vercel (Next.js 16 compatible).
- Static assets:
  - Served via Vercel’s global CDN.
  - Images optimized by Next.js’ built‑in image optimization.

### 2.2 Firebase

- **Firestore**
  - Stores users, payments, passes, and teams.
  - Enforced by `firestore.rules` and (optionally) `firestore.indexes.json`.

- **Firebase Authentication**
  - Handles Google sign‑in from the frontend.
  - Provides ID tokens for backend authorization.

- **Firebase Admin SDK**
  - Used only in serverless API routes (never in client code).
  - Initialized in `src/lib/firebase/adminApp.ts`.

`firebase.json` in the repo is used only for **rules** and **indexes** deployment, not for Firebase Hosting.

---

## 3. Next.js Configuration

Configuration is defined in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  experimental: {
    serverComponentsHmrCache: false,
  },
  turbopack: {},
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  compress: true,
  poweredByHeader: false,
  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxSize: 200000,
        },
      };
    }
    return config;
  },
};
```

Key aspects:

- **COOP header** (`same-origin-allow-popups`) – supports Cashfree popup/modal behavior.
- **Image optimization** – AVIF/WebP, device/image sizes, 30‑day cache TTL.
- **Compression** – enabled (`compress: true`).
- **Security header** – `X-Powered-By` removed.
- **Code splitting** – `maxSize: 200KB` for better caching; smaller chunks.
- **Turbopack** – enabled in dev for faster rebuilds.

---

## 4. Build & Run Commands

Defined in `package.json`:

| Script          | Command       | Purpose                                 |
|-----------------|--------------|-----------------------------------------|
| `dev`           | `next dev`   | Local development server                |
| `build`         | `next build` | Production build                        |
| `start`         | `next start` | Run production build locally            |
| `lint`          | `eslint`     | Lint TypeScript/JS files                |
| `db:init`       | `node scripts/db/init-collections.js` | Create initial Firestore docs (`_init_`) |
| `db:clear`      | `node scripts/db/clear-database.js`   | Clear collections (use with caution)     |

Vercel uses `npm run build` by default, followed by serving via their managed runtime.

---

## 5. Environment Variables

### 5.1 Summary Table

These variables must be set in the environment (locally via `.env.local`, in production via Vercel’s environment settings).

| Variable                           | Type   | Required | Description                                  | Example Value                     |
|------------------------------------|--------|----------|----------------------------------------------|-----------------------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY`     | Public | Yes      | Firebase client API key                      | `AIzaSy...`                       |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Public | Yes      | Firebase auth domain                         | `cit-takshashila.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`  | Public | Yes      | Firebase project ID                          | `cit-takshashila-2026-3fd85`            |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Public | No      | Firebase storage bucket (if used)           | `cit-takshashila-2026-3fd85.firebasestorage.app`|
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Public | No | Messaging sender ID                          | `123456789012`                    |
| `NEXT_PUBLIC_FIREBASE_APP_ID`      | Public | Yes      | Firebase app ID                              | `1:123456789012:web:abcdef123456` |
| `FIREBASE_SERVICE_ACCOUNT_KEY`     | Secret | Yes*     | JSON for Admin SDK (stringified service account) | `{"type":"service_account",...}` |
| `FIREBASE_ADMIN_CLIENT_EMAIL`      | Secret | Yes*     | Admin client email (if splitting key)        | `firebase-admin@project.iam.gserviceaccount.com` |
| `FIREBASE_ADMIN_PRIVATE_KEY`       | Secret | Yes*     | PEM‑formatted private key (`-----BEGIN PRIVATE KEY-----...`) | `-----BEGIN PRIVATE KEY-----\n...` |
| `NEXT_PUBLIC_CASHFREE_APP_ID`      | Public | Yes      | Cashfree application ID                      | `CF12345`                         |
| `CASHFREE_SECRET_KEY`              | Secret | Yes      | Cashfree secret key                          | `sk_test_abc123`                  |
| `NEXT_PUBLIC_CASHFREE_ENV`         | Public | Yes      | Cashfree environment (`sandbox` \| `production`) | `sandbox`                     |
| `RESEND_API_KEY`                   | Secret | No*      | Resend email API key                         | `re_xxx`                          |
| `QR_SECRET_KEY`                    | Secret | Yes      | Secret for QR HMAC signing                    | Random 32+ char string            |
| `NEXT_PUBLIC_APP_URL` / `APP_URL`  | Both   | No*      | Live app URL (payment callbacks, referral link fallback) | `https://takshashila26.in` |

Notes:

- For **live domain**: set `NEXT_PUBLIC_APP_URL` or `APP_URL` to your production URL (e.g. `https://takshashila26.in`) so payment return URLs and the referral link fallback use the correct domain.
- For `FIREBASE_SERVICE_ACCOUNT_KEY` vs `FIREBASE_ADMIN_*`:
  - The code supports both a single JSON string or split fields.
  - Use one consistent pattern in all environments.

### 5.2 Local Environment

Local development uses `.env.local` (ignored by Git). Typical content:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cit-takshashila.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cit-takshashila-2026-3fd85
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cit-takshashila-2026-3fd85.firebasestorage.app
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"cit-takshashila-2026-3fd85", ...}

NEXT_PUBLIC_CASHFREE_APP_ID=CF_TEST_APP_ID
CASHFREE_SECRET_KEY=CF_TEST_SECRET
NEXT_PUBLIC_CASHFREE_ENV=sandbox

RESEND_API_KEY=re_test_...
QR_SECRET_KEY=change_this_in_production
```

To avoid accidental commits, `.env*` files are excluded via `.gitignore`.

### 5.3 Production Environment

In Vercel:

- Configure environment variables via **Project Settings → Environment Variables**.
- Use:
  - `Production` environment for live site.
  - `Preview` and `Development` as needed.
- Set `NEXT_PUBLIC_CASHFREE_ENV=production` when going live and Cashfree account is fully configured.

**Important:** Set a strong, unique `QR_SECRET_KEY` and never rely on any default.

---

## 6. Firebase Rules & Index Deployment

### 6.1 Rules

Rules are stored in `firestore.rules` and configured in `firebase.json`:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

Deploy rules using Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

### 6.2 Indexes

- Composite indexes are defined in `firestore.indexes.json` (currently empty; Firestore auto‑indexes single fields).
- When Firestore prompts for an index (e.g. for complex queries on `passes`), add the suggested index to `firestore.indexes.json` and deploy:

```bash
firebase deploy --only firestore:indexes
```

---

## 7. CI/CD Workflow

Typical workflow with Vercel + GitHub:

1. **Local development**
   - Pull latest code, run `npm install`.
   - Configure `.env.local`.
   - Run `npm run dev`.
2. **Git workflow**
   - Create feature branches off `main`.
   - Commit changes and push to origin.
3. **Preview deployments**
   - Each PR/branch push triggers a preview deployment on Vercel.
   - Preview URLs are used for QA and demos.
4. **Production deployment**
   - Merge to `main` triggers a production deployment.
   - Vercel:
     - Installs dependencies.
     - Runs `next build`.
     - Deploys static assets and serverless functions.
5. **Post‑deploy checks**
   - Verify:
     - Home page loads.
     - Login and profile flows.
     - Pass selection and payment sandbox flow.
     - QR generation and “My Pass” page.

Rollback:

- If a deployment is bad:
  - Use Vercel’s “Promote previous deployment” to roll back to a known good version.

---

## 8. Operational Considerations

### 8.1 Secrets Management

- Do **not** commit secrets to Git.
- Use:
  - `.env.local` for local dev (ignored).
  - Vercel environment variables for production and previews.
- Confirm:
  - `FIREBASE_SERVICE_ACCOUNT_KEY`, `CASHFREE_SECRET_KEY`, `RESEND_API_KEY`, `QR_SECRET_KEY` are never logged or exposed.

### 8.2 Regions & Latency

- Vercel and Firebase both have multi‑region clouds; for best latency:
  - Choose a Firebase region closest to primary users.
  - Configure Vercel project region accordingly (if applicable).

### 8.3 Cashfree Configuration

- Ensure:
  - Correct **allowed callback URLs** are configured in Cashfree dashboard (for `/payment/callback` and webhooks).
  - Webhook URL (`/api/webhooks/cashfree`) is registered with correct secret.

---

## 9. Deployment Checklist

Before going live:

1. **Firebase**
   - [ ] Create production Firebase project.
   - [ ] Enable Firestore and Authentication (Google).
   - [ ] **Add your live domain to Authorized domains:** Firebase Console → Authentication → Settings → Authorized domains → Add domain (e.g. `takshashila26.in`). Add both `www` and apex if users can land on either.
   - [ ] Create service account and download JSON.
   - [ ] Set Firestore rules via `firebase deploy --only firestore:rules`.

2. **Cashfree**
   - [ ] Switch account to production.
   - [ ] Configure `notify_url` and callback URLs.
   - [ ] Set `NEXT_PUBLIC_CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY` for production.

3. **Resend**
   - [ ] Configure production sender domain.
   - [ ] Set `RESEND_API_KEY` for production.

4. **Vercel**
   - [ ] Link GitHub repo.
   - [ ] Configure all environment variables.
   - [ ] Set `NEXT_PUBLIC_APP_URL` (or `APP_URL`) to your live URL (e.g. `https://takshashila26.in`) for payment callbacks and referral link fallback.
   - [ ] Trigger initial production build.

5. **Security**
   - [ ] Set strong `QR_SECRET_KEY`.
   - [ ] Confirm `QR_SECRET_KEY` is consistent across all environments.
   - [ ] Protect `/api/admin/fix-stuck-payment` (e.g. internal tooling only).

6. **Smoke Tests**
   - [ ] Login / logout.
   - [ ] Profile creation.
   - [ ] Each pass type purchase in sandbox (then production with low values).
   - [ ] Pass display and PDF download.
   - [ ] QR scanning + member check‑in (on a test environment).

---

## 10. Summary

- **Vercel** hosts the Next.js frontend and serverless API routes.
- **Firebase** provides a secure, scalable backend for auth and data.
- **Cashfree** and **Resend** are integrated via serverless routes, configured through environment variables.
- Deployments are automatic and repeatable via Git → Vercel CI/CD, with Firebase rules/indexes managed via Firebase CLI.

For operational monitoring and maintenance, see `MAINTENANCE_OPERATIONS.md`. For developer workflow details, see `DEVELOPER_GUIDE.md`.

