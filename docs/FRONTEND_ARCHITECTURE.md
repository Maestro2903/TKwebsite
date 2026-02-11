## 1. Frontend Overview

The frontend is a **React 19** application built with **Next.js 16 App Router** and **TypeScript**. It provides:

- Marketing pages (home, events, proshows, SaNa Arena)
- Registration and payment user flows
- Auth‑aware navigation and pass viewing
- Organizer‑friendly layouts (sticky CTAs, clear hierarchy)

Styling is implemented with **Tailwind CSS 4** and a small set of custom CSS files in `styles/`, plus animation libraries (Framer Motion, GSAP, Lenis).

---

## 2. Folder & File Structure

### 2.1 High-Level Layout

```text
TKwebsite/
├── app/                    # Next.js App Router (pages + API routes)
│   ├── api/                # API route handlers (server)
│   ├── events/             # /events page
│   ├── events-rules/       # /events-rules page
│   ├── login/              # /login page
│   ├── payment/            # /payment/* pages
│   ├── proshows/           # /proshows page
│   ├── register/           # /register/* pages
│   ├── sana-arena/         # /sana-arena page
│   ├── test-font/          # internal font testing page
│   ├── layout.tsx          # root layout (ClientLayout + providers)
│   └── page.tsx            # home page
├── src/
│   ├── components/
│   │   ├── decorative/     # visual effects & backgrounds
│   │   ├── layout/         # navigation, footer, client layout
│   │   ├── sections/       # page-level sections (home, events, proshows, registration)
│   │   ├── ui/             # reusable UI primitives
│   │   └── v1/             # legacy/experimental components
│   ├── contexts/           # React context providers
│   ├── data/               # static config & content (events, passes, shows, rules)
│   ├── features/           # feature modules (auth, email, passes, payments)
│   ├── hooks/              # custom hooks (Lenis, GSAP)
│   ├── lib/                # shared frontend utilities (Firebase client, helpers)
│   └── types/              # shared TypeScript types
├── styles/                 # global CSS
│   ├── globals.css
│   ├── components.css
│   ├── glowing-dots-grid.css
│   └── reset.css
└── public/                 # static assets (images, fonts, video, audio)
```

### 2.2 Components

**`src/components/layout/`**

- `ClientLayout` – wraps the app with context providers and loading screen
- `Navigation` – top navigation bar (desktop + mobile)
- `Footer` – global footer with key links and CTA
- `StickyRegisterCTA` – sticky registration call‑to‑action on certain pages

**`src/components/sections/`**

- `home/` – hero, about, marquee, sponsors, services and works, etc.
- `events/` – events hero, category switch, events grid, event details modal
- `proshows/` – proshows hero and schedule
- `registration/` – registration hero, urgency section, passes grid, modals

**`src/components/ui/`**

- Buttons, cards, lightbox, barcode/QR display, loading screen and other reusable primitives.

**`src/components/decorative/`**

- `GlowingDotsGrid`, `FabricGridBackground`, `SplineWithFallback`, badges and other visual FX components.

### 2.3 Contexts, Features, Hooks

- `src/contexts/LoadingContext.tsx` – manages the initial loading screen state.
- `src/features/auth/AuthContext.tsx` – manages Firebase auth state and user profile.
- `src/features/payments/cashfreeClient.ts` – wraps Cashfree JS SDK for frontend checkout.
- `src/features/email/emailService.ts` – email sending (used from server, but colocated in features).
- `src/features/passes/*` – QR generation, PDF generation and pass utilities.
- `src/hooks/useLenis.ts` – smooth scrolling.
- `src/hooks/useGSAP.ts` – GSAP animation integration.

---

## 3. Routing Strategy

Routing uses the **Next.js App Router** with each route folder under `app/`:

| Route                | File                                   | Description                                                 |
|----------------------|----------------------------------------|-------------------------------------------------------------|
| `/`                  | `app/page.tsx`                         | Landing page                                                |
| `/events`            | `app/events/page.tsx`                  | Events listing with filters                                 |
| `/events-rules`      | `app/events-rules/page.tsx`            | Event rules & guidelines                                   |
| `/proshows`          | `app/proshows/page.tsx`                | Proshows overview                                           |
| `/sana-arena`        | `app/sana-arena/page.tsx`              | SaNa concert / music portfolio                             |
| `/login`             | `app/login/page.tsx`                   | Google sign‑in entry point                                 |
| `/register`          | `app/register/page.tsx`                | Registration entry (routes user based on auth/profile)     |
| `/register/profile`  | `app/register/profile/page.tsx`        | Profile completion form                                     |
| `/register/pass`     | `app/register/pass/page.tsx`           | Pass selection + Cashfree checkout initiation              |
| `/register/my-pass`  | `app/register/my-pass/page.tsx`        | List and download user’s passes                            |
| `/register/success`  | `app/register/success/page.tsx`        | Post‑registration success                                  |
| `/payment/callback`  | `app/payment/callback/page.tsx`        | Cashfree redirect callback (verifies order)                |
| `/payment/success`   | `app/payment/success/page.tsx`         | Clean success presentation                                 |
| `/test-font`         | `app/test-font/page.tsx`               | Internal font testing                                       |

API routes live under `app/api/**` and are covered in `BACKEND_API_REFERENCE.md`.

### 3.1 Auth-Based Routing

Key client‑side routing behaviors:

- `/register`
  - If **not signed in** → redirect to `/login`
  - If signed in **without profile** → redirect to `/register/profile`
  - If profile exists → redirect to `/register/pass`
- `/login`
  - If already signed in → redirect to `/register`
- `/register/pass`
  - If not signed in → redirect to `/login`
  - If signed in but profile missing → redirect to `/register/profile`
- `/register/my-pass`
  - Requires authenticated user; otherwise redirect to `/login`

These behaviors are implemented using `useAuth()` (from `AuthContext`) and `useRouter` / `usePathname` in the relevant pages.

---

## 4. State Management

The app intentionally avoids heavy global state libraries (Redux, Zustand). State is managed with:

### 4.1 React Contexts

- **`AuthContext`** (`src/features/auth/AuthContext.tsx`)
  - Exposes:
    - `user: firebase.auth.User | null`
    - `userData: UserProfile | null` (from Firestore `users/{uid}`)
    - `loading: boolean` – auth initialization state
    - `signIn(): Promise<unknown>` – Google sign‑in (popup or redirect)
    - `signOut(): Promise<void>` – sign out
    - `updateUserProfile(data: UserProfileUpdate): Promise<void>` – write profile to Firestore
  - Uses:
    - `getAuthSafe()` from `src/lib/firebase/clientApp.ts`
    - `onAuthStateChanged` and `getRedirectResult` to track auth status
    - `getDoc`/`setDoc` on `db` (`users` collection) for profile data

- **`LoadingContext`** (`src/contexts/LoadingContext.tsx`)
  - Manages the initial animated loading screen.
  - Stores a flag (e.g. in `sessionStorage`) to show loading only once per session.
  - Exposes `isLoading`, `hasLoadedOnce`, and update methods.

Both contexts are composed inside `ClientLayout`, which is used by `app/layout.tsx`.

### 4.2 Local Component State

Pages and sections use `useState` / `useEffect` for:

- Modal visibility (`PassSelectorModal`, `DayPassModal`, `GroupRegistrationModal`)
- Selected categories (events page)
- Scroll‑related UI (e.g. hiding category bars, sticky CTA thresholds)
- Loading and error flags for client‑side data fetches

### 4.3 Data Sources

- **Static data** (`src/data/`):
  - `events` – technical / non‑technical events metadata
  - `passes` – `REGISTRATION_PASSES` with amount, label, description
  - `shows` – proshows schedule
  - `rules` – event rules content
  - `config` – registration config (e.g. banners, copy)

- **Firestore (client SDK)**:
  - Used where the user can safely read their own data:
    - Fetching passes in “My Pass” page
    - Reading user profile data

- **API routes (BFF)**:
  - Used for all sensitive operations:
    - Creating payment orders
    - Verifying payments
    - Generating passes and PDFs
    - Scanning passes / team members

---

## 5. UI Component Hierarchy

### 5.1 Global Layout

Every page (except special routes like some API handlers) follows a common structure:

```tsx
<ClientLayout>
  <Navigation />
  <main className="page_main page_main--{variant}">
    {/* Page‑specific sections */}
  </main>
  <Footer />
  {/* Optional <StickyRegisterCTA /> on key pages */}
</ClientLayout>
```

- `ClientLayout` injects global providers (auth, loading) and the loading screen.
- `Navigation` adapts appearance based on route (e.g. special SaNa treatment).
- `Footer` contains primary site navigation and “Get Your Gate Pass” CTA.
- `StickyRegisterCTA` appears on pages where conversion is important (e.g. `/events`, `/proshows`, `/sana-arena`).

### 5.2 Page-Level Sections

Examples:

- **Home (`app/page.tsx`)**
  - Hero section with video/visuals
  - About / story
  - Marquee and works
  - Services & works grid
  - Sponsors section
  - CTA section

- **Events (`app/events/page.tsx`)**
  - Events hero
  - Category switch (technical / non‑technical)
  - Events grid (cards)
  - Event details modal
  - Sticky register CTA

- **Registration (`app/register/*`)**
  - Registration hero + urgency messaging
  - Registration passes grid
  - Pass selection modal
  - Day pass / group registration modals
  - Success page summarizing purchased pass
  - My Pass page: list of passes, PDF/QR download

Each section is implemented as a React component under `src/components/sections/**` and composed inside the relevant page.

---

## 6. Role-Based UI Behaviour

There are two effective roles, reflected in the UI:

- **Regular user**
  - Sees marketing pages and registration flows.
  - Can:
    - Sign in with Google
    - Complete and edit profile
    - Purchase passes
    - View/download their own passes

- **Organizer**
  - Marked via `isOrganizer: true` on `users/{uid}` in Firestore.
  - Gains access (via frontend logic and API responses) to:
    - Pass scanning tools (for gates)
    - Team member check‑in functionality
  - Organizer‑specific UIs are minimal and mostly revolve around scan/check‑in workflows; they rely heavily on the API responses that expose more detailed pass/team data.

Access to organizer functions is always backed by server‑side checks; the UI simply provides entry points and labels.

---

## 7. Styling & Theming

### 7.1 Tailwind + Custom CSS

- Tailwind CSS 4 via `@tailwindcss/postcss` in `postcss.config.mjs`.
- Utility‑first styling for layout, spacing, typography.
- Custom CSS files:
  - `styles/globals.css` – base styles, layout, typography and global components.
  - `styles/components.css` – additional component classes.
  - `styles/reset.css` – reset/normalize styles.
  - `styles/glowing-dots-grid.css` – specialized background/grid effects.

### 7.2 Utility Helpers

- `cn` helper (`clsx` + `tailwind-merge`) from `src/lib/utils.ts` (or similar):
  - Ensures class name merging with deduplication, especially for conditional classes.

---

## 8. Performance Considerations

The frontend implements several performance‑oriented patterns:

- **Dynamic imports** for heavy sections:
  - Large visual components (e.g. rich hero sections, proshow schedule) are loaded with `next/dynamic`, often with a skeleton `<div style={{ minHeight: ... }}>` placeholder.

- **Code splitting**
  - `next.config.ts` configures Webpack to split chunks and cap chunk size at ~200KB for better caching.

- **Image optimization**
  - Next.js Image component with:
    - AVIF/WebP formats
    - Device and image sizes defined
    - 30‑day cache TTL

- **Smooth and efficient animations**
  - **Framer Motion** for React‑friendly animations where appropriate.
  - **GSAP** for high‑control animation sequences via `useGSAP` hook.
  - **Lenis** for smooth scrolling with requestAnimationFrame integration.

- **Loading experience**
  - A single rich loading screen per browser session reduces perceived wait time on first visit while avoiding repeated animation overhead on subsequent navigations.

---

## 9. Frontend Responsibilities vs Backend

To summarize:

- Frontend **does**:
  - Render all marketing and registration UX.
  - Handle auth flows via Firebase client SDK.
  - Drive navigation and route guards based on auth/profile.
  - Collect payment intent details and call BFF API routes.
  - Display passes, QR codes and success/failure states.

- Frontend **does not**:
  - Talk directly to Cashfree or Resend (always goes through API routes).
  - Perform any privileged writes to Firestore (those are handled via Admin SDK in API routes).
  - Decide access beyond what the backend and Firestore security rules enforce.

For API responsibilities and data contracts, refer to `BACKEND_API_REFERENCE.md` and `DATABASE_SCHEMA.md`.

