# Project Layout & Architecture — CIT Takshashila (Zeit Media Clone)

This document describes the **current project structure**, **architecture**, **tech stack**, and **data flow** of the zeitmedia-clone app (CIT Takshashila website).

---

## 1. Overview

- **Project name:** `zeitmedia-clone`
- **Purpose:** CIT Takshashila — Chennai's Premier Techno-Cultural Fiesta (event/registration site with payments)
- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Firebase (Auth + Firestore), Cashfree (payments), Vercel-ready
- **Design:** Dark editorial / media-agency style; see [DESIGN-LANGUAGE.md](./DESIGN-LANGUAGE.md) for colors, typography, and components

---

## 2. Repository Layout

The codebase is split into **frontend** (UI) and **backend** (server logic) folders for clarity.

```
zeitmedia-clone/
├── frontend/                     # UI code (components, contexts, hooks)
│   ├── components/
│   ├── contexts/
│   └── hooks/
├── backend/                      # Server logic and shared libraries
│   └── lib/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (import from backend/lib)
│   │   ├── create-order/         # Create Cashfree order + Firestore registration
│   │   │   └── route.ts
│   │   ├── payment/
│   │   │   ├── create-order/
│   │   │   └── verify/
│   │   └── webhooks/
│   │       └── cashfree/
│   │           └── route.ts      # Cashfree PAYMENT_SUCCESS_WEBHOOK handler
│   ├── events/
│   │   └── page.tsx              # Events listing (tech / non-tech)
│   ├── proshows/
│   │   └── page.tsx              # Proshows page
│   ├── register/
│   │   ├── page.tsx              # Pass selection + sign-in gate
│   │   ├── my-pass/
│   │   │   └── page.tsx          # User's pass / QR (post-login)
│   │   └── success/
│   │       └── page.tsx          # Post-payment success
│   ├── sana-arena/
│   │   └── page.tsx              # Sana Arena landing
│   ├── layout.tsx                # Root layout (AuthProvider, metadata)
│   ├── page.tsx                  # Home (hero, about, marquee, services, CTA)
│   ├── globals.css               # Design system, layout, components
│   ├── marquee-globals.css       # Marquee + scaling video styles
│   ├── webflow.css               # Normalize / base HTML
│   └── favicon.ico
├── frontend/components/          # React UI components
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── AboutSection.tsx
│   ├── FeaturedClientsSection.tsx
│   ├── MarqueeSection.tsx
│   ├── ScalingVideoSection.tsx
│   ├── ServicesAndWorksSection.tsx
│   ├── SponsorsSection.tsx
│   ├── CTASection.tsx
│   ├── Lightbox.tsx
│   ├── EventsHero.tsx
│   ├── EventCategorySwitch.tsx
│   ├── EventCard.tsx
│   ├── EventsGrid.tsx
│   ├── StickyRegisterCTA.tsx
│   ├── RegistrationHero.tsx
│   ├── RegistrationUrgency.tsx
│   ├── PassCard.tsx
│   ├── RegistrationPassesGrid.tsx
│   ├── RegistrationStickyCTA.tsx
│   ├── PassSelectorModal.tsx
│   ├── RegistrationFormModal.tsx
│   ├── ShowsHero.tsx
│   ├── ShowCard.tsx
│   ├── ShowsSchedule.tsx
│   ├── ProshowsY2KDecor.tsx
│   ├── SplineWithFallback.tsx
│   ├── hero-ascii-one.tsx
│   ├── PixelCard.tsx
│   ├── AwardBadge.tsx
│   └── ServiceCardsSection.tsx, WorksSection.tsx, etc.
├── frontend/contexts/
│   └── AuthContext.tsx           # Firebase auth state (user, signIn, signOut)
├── frontend/hooks/
│   └── useLenis.ts               # Lenis smooth scroll
├── backend/lib/                  # Shared logic & config (server + client libs)
│   ├── firebase.ts               # Client Firebase app, auth, Firestore
│   ├── firebase-admin.ts         # Server Firebase Admin (API routes)
│   ├── auth.ts                   # signInWithGoogle, signOut
│   ├── firestore-types.ts        # PassType, PaymentStatus, UserProfile, Registration
│   ├── eventsData.ts             # NON_TECHNICAL_EVENTS, TECHNICAL_EVENTS
│   ├── showsData.ts              # Proshows data
│   ├── registrationPassesData.ts # Pass options (Day, Group, Proshow, All-Access)
│   ├── registrationConfig.ts     # Countdown target, etc.
│   └── cashfree.ts               # Cashfree SDK usage (if any)
├── public/
│   ├── assets/
│   │   ├── fonts/                # Inter Display, Dirtyline
│   │   ├── images/               # Parallax, sana-arena, dots
│   │   ├── marquee/              # Marquee images (avif)
│   │   ├── audio/
│   │   └── spline/               # scene.splinecode
│   ├── images/
│   │   ├── about/
│   │   ├── event/                # tech/, nontech/, Sponsors/
│   │   └── ...
│   ├── videos/                   # Hero, sana-arena, 3d-zeit
│   ├── tk-logo.svg
│   └── favicon.ico
├── scripts/
│   ├── db/                       # Database utilities (init, clear, debug)
│   ├── users/                    # User management (list, find, dump)
│   ├── testing/                  # Test helpers (email, PDF, payment)
│   ├── admin/                    # Admin tasks
│   └── utils/                    # Shell utilities
├── docs/
│   ├── DESIGN-LANGUAGE.md
│   └── PROJECT-LAYOUT-AND-ARCHITECTURE.md  (this file)
├── .env / .env.example           # Firebase, Cashfree, optional Resend
├── .gitignore
├── .vercelignore
├── firestore.rules               # Firestore security rules
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── eslint.config.mjs
└── README.md
```

---

## 3. Tech Stack

| Layer        | Technology |
|-------------|------------|
| Framework   | Next.js 16 (App Router) |
| UI          | React 19 |
| Language    | TypeScript 5 |
| Styling     | Tailwind CSS 4, global CSS (design tokens in `globals.css`) |
| Auth        | Firebase Auth (Google sign-in) |
| Database    | Firebase Firestore (registrations, users) |
| Payments    | Cashfree (orders + webhook for PAYMENT_SUCCESS_WEBHOOK) |
| Smooth scroll | Lenis (`@studio-freight/lenis`) |
| 3D / media  | GSAP, Three.js, Spline (`@splinetool/react-spline`), HLS.js (video), `@paper-design/shaders-react` |
| Deployment  | Vercel (`.vercelignore` present) |

---

## 4. Architecture

### 4.1 High-level flow

- **Client:** Next.js app with client components for auth, modals, and interactive sections; root layout wraps app in `AuthProvider`.
- **Auth:** Firebase Auth (Google). `AuthContext` exposes `user`, `loading`, `signIn`, `signOut`. Used on `/register` to gate pass selection and payment.
- **Payments:** User selects pass → signs in (if needed) → fills form → `POST /api/create-order` (Bearer Firebase ID token) → creates Cashfree order and a Firestore `registrations` doc with `paymentStatus: PENDING` → client redirects to Cashfree checkout → on success Cashfree calls `POST /api/webhooks/cashfree` → webhook verifies signature, finds registration by `cashfreeOrderId`, sets `paymentStatus: PAID` and `qrPayload` (doc id). User sees success at `/register/success` and can view pass/QR at `/register/my-pass`.

### 4.2 Route structure

| Route | Purpose |
|-------|--------|
| `/` | Home: hero, about, marquee, scaling video, services & works, sponsors, CTA |
| `/events` | Events: hero, category switch (tech / non-tech), events grid, sticky CTA |
| `/proshows` | Proshows landing |
| `/sana-arena` | Sana Arena landing |
| `/register` | Registration: sign-in gate → pass grid → modal form → create order → Cashfree |
| `/register/success` | Post-payment success |
| `/register/my-pass` | User’s pass / QR (authenticated) |
| `POST /api/create-order` | Create Cashfree order + Firestore registration (requires Firebase ID token) |
| `POST /api/webhooks/cashfree` | Cashfree webhook: verify signature, update registration to PAID, set `qrPayload` |

### 4.3 Data and types

- **Firestore**
  - `users/{userId}` — read/write by owner (for profile data if used).
  - `registrations/{doc}` — create by authenticated user; read by owner only; no client updates (webhook updates server-side). Fields: `uid`, `passType`, `amount`, `paymentStatus`, `cashfreeOrderId`, `createdAt`, `qrPayload`, `updatedAt`.
- **Types** (`lib/firestore-types.ts`): `PassType`, `PaymentStatus`, `UserProfile`, `Registration`.
- **Static/config data:** `lib/eventsData.ts`, `lib/showsData.ts`, `lib/registrationPassesData.ts`, `lib/registrationConfig.ts`.

### 4.4 Path aliases

- `@/*` → project root (e.g. `@/backend/...`, `@/app/...`)
- `@/components/*` → `./frontend/components/*`
- `@/contexts/*` → `./frontend/contexts/*`
- `@/hooks/*` → `./frontend/hooks/*`
- `@/lib/*` → `./backend/lib/*` (use this, NOT `@/backend/lib`)

Defined in `tsconfig.json` under `compilerOptions.paths`.

> **Import Convention:** Always use `@/lib/*` for backend library imports, never `@/backend/lib/*`.

---

## 5. Key Files Summary

| File | Role |
|------|------|
| `app/layout.tsx` | Root layout; `AuthProvider`; metadata (title, description, OG). |
| `app/page.tsx` | Home: composes Navigation, Hero, About, FeaturedClients, Marquee, ScalingVideo, ServicesAndWorks, Sponsors, CTA, Lightbox; uses `useLenis`. |
| `app/globals.css` | Design system (variables, grid, nav, buttons, cards, events, registration, responsive). |
| `app/api/create-order/route.ts` | Verifies Firebase ID token; validates body (passType, amount, customer); creates Cashfree order; writes `registrations` doc; returns `order_id`, `payment_session_id`. |
| `app/api/webhooks/cashfree/route.ts` | Verifies webhook signature; on `PAYMENT_SUCCESS_WEBHOOK` finds registration by Cashfree order id; updates to `PAID`, sets `qrPayload`. |
| `contexts/AuthContext.tsx` | Provides `user`, `loading`, `signIn`, `signOut` via Firebase `onAuthStateChanged`. |
| `lib/firebase.ts` | Client Firebase app, auth, Firestore (singletons). |
| `lib/firebase-admin.ts` | Server Firebase Admin (auth, Firestore) for API routes. |
| `lib/auth.ts` | `signInWithGoogle()`, `signOut()` using client auth. |
| `firestore.rules` | Users: read/write own doc; registrations: read own, create when authenticated; no client update/delete. |

---

## 6. Environment Variables

(From `.env.example`; do not commit real values.)

- **Firebase (client):** `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- **Firebase Admin (server):** Service account JSON as single line (e.g. `FIREBASE_SERVICE_ACCOUNT_KEY`)
- **Cashfree:** `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`; frontend mode: `NEXT_PUBLIC_CASHFREE_MODE` (sandbox | production)
- **Optional:** `RESEND_API_KEY` for confirmation emails (not wired yet)

---

## 7. Scripts

- `npm run dev` — Next.js dev server
- `npm run build` — Production build
- `npm run start` — Production server
- `npm run download-assets` — `node scripts/download-external-assets.mjs`
- `npm run lint` — ESLint

---

## 8. Design System Reference

For colors, typography, spacing, grid, components, motion, and breakpoints, see **[DESIGN-LANGUAGE.md](./DESIGN-LANGUAGE.md)**. The file map there also lists which components and CSS files implement each part of the UI.

---

*Last updated to reflect the current project layout and architecture.*
