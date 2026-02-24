## Frontend Architecture

This document describes the frontend architecture of the TKwebsite app: App Router structure, layouts, components, contexts, hooks, design system, animations, and performance patterns.

All details are based on the code under `app/**`, `src/components/**`, `src/features/**`, `src/contexts/**`, `styles/**`, and related modules.

---

### App Router Structure & Layout Hierarchy

#### Root Layout

- **File**: `app/layout.tsx`
- **Responsibilities**:
  - Imports global styles: `@/styles/globals.css`.
  - Loads multiple Google fonts (Space Grotesk, Bebas Neue, DM Sans, Syne, Inter, JetBrains Mono) and exposes them via CSS variables.
  - Defines:
    - `viewport` (`width=device-width`, `initialScale=1`, `viewportFit=cover`).
    - `metadata` (title, description, OpenGraph, Twitter metadata) with `metadataBase` set to `https://cittakshashila.org`.
  - Wraps the app in:
    - `LenisProvider` (smooth scrolling context).
    - `ClientLayout` (global loading experience + referral capture).
    - `AuthProvider` (Firebase auth + profile).
    - `Navbar`.
  - Injects JSON-LD scripts:
    - Organization schema (`Organization`).
    - Event schema (`Event` describing the festival).

Rendering tree from `RootLayout`:

- `<html lang="en" className="...font variables...">`
  - `<body className={dmSans.className}>`
    - `<LenisProvider>`
      - `<ClientLayout>`
        - `<AuthProvider>`
          - `<AppContent>`
            - `<Navbar />`
            - `<div id="main-content">children</div>`

#### Route Layouts

Each major section has an optional layout that sets metadata and (for register/events) breadcrumb JSON-LD:

- `app/events/layout.tsx`
- `app/register/layout.tsx`
- `app/proshows/layout.tsx`
- `app/events-rules/layout.tsx`
- `app/sana-arena/layout.tsx`

These are simple server components that:
- Provide route-specific `Metadata`.
- For events and register pages, inject structured breadcrumb JSON-LD.
- Return `{children}` as-is, relying on the root layout for shells (navbar, providers).

#### Pages and Responsibilities

Most pages are client components (`'use client'`) to support hooks, animations, and event handlers:

- `/` → `app/page.tsx`
  - Hero video, marquee, about, highlights, sponsors, scaling video, services & works, CTA, and showreel lightbox.
- `/login` → `app/login/page.tsx`
  - Login UX using `useAuth()` and Google sign-in from `AuthContext`.
  - On sign-in, redirects to `/register`.
- `/register` → `app/register/page.tsx`
  - Routing orchestrator:
    - If not authenticated: redirects to `/login`.
    - If profile exists: redirects to `/register/pass`.
    - Else: redirects to `/register/profile`.
- `/register/profile` → `app/register/profile/page.tsx`
  - Renders a profile form (name, college, phone, ID card upload) via components under `src/components/sections/registration/**`.
  - Uses Firebase client Firestore to store profile data (`users` collection), and `AuthContext` for auth state.
- `/register/pass` → `app/register/pass/page.tsx`
  - Shows available passes (day, group, proshow, SANA, etc.) via `RegistrationPassesGrid`.
  - Uses pass-specific modals that trigger `/api/payment/create-order` and `openCashfreeCheckout`.
- `/register/my-pass` → `app/register/my-pass/page.tsx`
  - Fetches passes for the authenticated user via `/api/users/passes`.
  - Renders `MyPassCard` and an interactive `Lanyard` 3D view, and allows downloading a pass PDF (client-side).
- `/register/success` → `app/register/success/page.tsx`
  - Post-payment UX with countdown redirect to `/register/my-pass`.
- `/events` → `app/events/page.tsx`
  - Events hero + category switcher (technical / non-technical).
  - Uses `EventsGrid` to render events, leveraging GSAP animations.
- `/events-rules` → `app/events-rules/page.tsx`
  - Rulebook-style interface:
    - Sidebar with rule categories.
    - Content area driven by `EVENT_RULES` static data.
    - Keyboard navigation support and “Register” CTA.
- `/proshows` → `app/proshows/page.tsx`
  - Cinematic proshows layout with proshow cards and call-to-action.
- `/sana-arena` → `app/sana-arena/page.tsx`
  - SANTHOSH NARAYANAN concert microsite:
    - Hero section with SANA pass card.
    - “Enter the Arena” launches the `MusicPortfolio` immersive experience.
    - Register button linking to `/register/pass`.
- `/payment/callback` → `app/payment/callback/page.tsx`
  - Receives `order_id` from Cashfree `return_url`.
  - Auth-aware:
    - If user is not signed in, prompts sign-in and then retries verification.
  - Calls `/api/payment/verify` with simple retry/backoff before redirecting to `/register/my-pass`.
- `/payment/success` → `app/payment/success/page.tsx`
  - Legacy/alternate verification page:
    - Uses `order_id` and optionally ID token to call `/api/payment/verify`.
    - Renders verifying / success / error states, then redirects appropriately.

There is no admin dashboard UI in `app/**`; organizer/admin capabilities are surfaced through APIs and external scanner tools, not internal pages.

---

### Component Structure & Design Language

#### Layout Components

- **`ClientLayout`** (`src/components/layout/ClientLayout.tsx`)
  - Client-side wrapper:
    - Wraps children in `LoadingProvider`.
    - Calls `useReferralCapture()` on mount to capture `?ref=` query params into `localStorage` and clean the URL with `history.replaceState`.
    - Reads `isLoading` and `hasLoadedOnce` from `LoadingContext`.
    - Renders `LoadingScreen` overlay until the first load completes, then fades to app content.

- **`Navbar`** (`src/components/layout/Navbar/Navbar.tsx` and subcomponents)
  - Composed of:
    - Desktop links, mobile menu toggle, overlay, and auth controls.
  - Uses:
    - `useAuth()` for user and profile info; shows “My Pass” + sign-out when logged in.
    - `useNavbarScroll(navRef)` to apply `data-*` attributes that control show/hide transitions purely via CSS.
    - `useLockBodyScroll(menuOpen)` to freeze body + Lenis scroll when mobile menu open.
  - Fully styled using Tailwind + custom CSS classes defined in `globals.css` (nav tokens and responsive behavior).

- **`StickyRegisterCTA`** (`src/components/layout/StickyRegisterCTA.tsx`)
  - Fixed-bottom CTA bar linking to `/register`.

- **`Footer`** (`src/components/layout/Footer.tsx`)
  - Uses `RadialGradientBg` to render a gradient background.
  - Contains nav links, address, contact, and social icons.

#### UI Primitives

Located mostly under `src/components/ui/**`:

- **Buttons / CTAs**
  - `GlassButton`:
    - Built with `class-variance-authority` for variants and sizes.
    - Can render as `<button>` or `<Link>` depending on `href` presence.
    - Used in hero sections, CTAs, etc.
  - `AwardBadge`:
    - Highly styled button-like element with background gradients and inline SVG.
    - Provides `variant` options (e.g., solid, gold) and optional `href/onClick`.

- **Cards**
  - `SciFiCard`:
    - Encapsulates card layout used for events and feature sections.
    - Supports header, body, optional image, and footer CTAs (often using `AwardBadge`).
  - `PassCard` and `PassCardTicket`:
    - Used for registration pass display in grids and modals.
  - `MyPassCard`:
    - Special card used on `/register/my-pass` to show pass details (type, amount, status, QR code placeholder) and a “Download PDF” button that drives client-side PDF generation.

- **Overlays & Tooltips**
  - `Lightbox`:
    - Displays media (e.g., showreel video) in an overlay.
  - `Tooltip` (`tooltip-card.tsx`):
    - Uses Framer Motion (`motion.div`, `AnimatePresence`) to show animated tooltip cards.
    - Tracks pointer/touch position and keeps tooltip within viewport.

- **3D Lanyard**

The 3D pass lanyard uses React Three Fiber and physics:

- `Lanyard` (`src/components/ui/Lanyard.tsx` + `Lanyard.css`):
  - Uses:
    - `@react-three/fiber` for the 3D canvas.
    - `@react-three/drei` for helpers.
    - `@react-three/rapier` for physics.
    - `meshline` for rope visualization.
  - Generates a canvas-based card face (`generateCardFaceDataUrl`):
    - Renders pass holder’s name, college, pass type, and QR code onto a 2D canvas.
    - Converts to a texture and maps onto the 3D card.
  - Handles:
    - WebGL context loss/resume.
    - Lowering DPR on mobile to reduce GPU load.
    - Re-using `THREE.Vector3` objects to avoid GC pressure.

#### Design System & CSS

- **Global stylesheet**: `styles/globals.css`
  - Imports:
    - `@import "tailwindcss";` (Tailwind v4).
    - `./reset.css`, `./components.css`, `./proshows-premium.css`.
    - `../node_modules/tw-animate-css/dist/tw-animate.css`.
    - `@import "shadcn/tailwind.css";`.
  - Defines:
    - `@custom-variant dark (&:is(.dark *));` for `.dark`-scoped dark mode.
    - `:root` CSS variables for:
      - Spacing (`--site--viewport-max`, `--_spacing---section-space--*`).
      - Typography (`--_typography---font--*`).
      - Shadcn-inspired OKLCH colors (`--background`, `--foreground`, `--primary`, etc.).
      - Navigation layout tokens (`--nav-height`, `--nav-padding-*`, `--nav-item-gap`, `--nav-logo-size`).
  - Applies base Tailwind tokens:
    - `@layer base { * { @apply border-border outline-ring/50; } body { @apply bg-background text-foreground; } }`.
  - Provides extensive layout and animation helpers:
    - Lenis scroll integration classes (`html.lenis`, `.lenis.lenis-smooth`, `.lenis.lenis-stopped`).
    - GPU hints (`will-change`, `translateZ(0)`, `backface-visibility: hidden`) for animated elements like `.horizontal-loop`, `.highlights-carousel__slide`, `.marquee-advanced`.
    - Navbar behavior driven by `data-scrolling-*` attributes (applied via `useNavbarScroll`).
    - Reduced-motion overrides for `prefers-reduced-motion: reduce`.

Tailwind is used primarily for spacing, layout, and utility classes on components, while the heavy visual identity (colors, animations, special effects) is encoded in the global CSS.

---

### State Management & Context Providers

The app uses React Context and hooks for global state; there is no Redux, Zustand, or React Query.

#### `AuthContext`

- **File**: `src/features/auth/AuthContext.tsx`
- **State**:
  - `user`: Firebase `User` object (client SDK).
  - `userData`: server-sourced profile from `appUsers/{uid}`.
  - `loading`: overall auth/profile loading flag.
- **Actions**:
  - `signIn`: wraps `signInWithGoogle()` from `authService.ts` (Google popup).
  - `signOut`: wraps Firebase `signOut`.
  - `updateUserProfile`: writes profile data to `appUsers/{uid}` via client Firestore (with `merge: true`), then updates local `userData`.
- **Behavior**:
  - Uses `onAuthStateChanged` from client `auth`.
  - Uses `getRedirectResult` to support redirect-based sign-in flows.
  - Tracks last fetched UID to avoid repeated Firestore reads on minor auth changes.

#### `LoadingContext`

- **File**: `src/contexts/LoadingContext.tsx`
- **State**:
  - `isLoading`: whether initial loading screen is active.
  - `hasLoadedOnce`: whether the loading screen has already been shown this session.
- **Behavior**:
  - On first mount in a session:
    - If `sessionStorage.getItem('hasSeenLoading') === 'true'`, it **skips** the loading overlay.
    - Otherwise, it shows `LoadingScreen` until the app signals readiness, then:
      - Sets `hasLoadedOnce` to `true`.
      - Sets `sessionStorage['hasSeenLoading'] = 'true'`.
  - `ClientLayout` uses this to avoid re-playing the heavy intro animation on every navigation.

#### `LenisContext`

- **File**: `src/contexts/LenisContext.tsx`
- **Responsibilities**:
  - Initializes and owns a **Lenis** instance for smooth scrolling.
  - Provides context with:
    - `lenis` instance.
    - `stop()` and `start()` methods to pause/resume smooth scrolling.
  - Hooks:
    - Integrates with GSAP’s ticker when GSAP is available to keep scroll updates in sync.
    - Exposes `useLenisControl()` for components/hooks that need to control or read scroll state.

Consumers:

- `useLockBodyScroll` stops Lenis while overlays (modals, mobile nav) are open.
- `useNavbarScroll` reads Lenis scroll values to control navbar visibility via data attributes.

---

### Custom Hooks & Data Fetching

#### `useGSAP`

- **File**: `src/hooks/useGSAP.ts`
- **Purpose**:
  - Client-only, lazy loader for GSAP and core plugins:
    - `gsap`, `ScrollTrigger`, `SplitText`, optionally `Flip`.
  - Ensures plugins are registered once and only on the client.
- **Usage**:
  - `EventsGrid`:
    - Animates event cards on scroll using `ScrollTrigger`.
    - Respects `prefers-reduced-motion` by short-circuiting animations.
  - `HighlightsCarousel`:
    - Builds a horizontal looping carousel using GSAP timelines and Draggable (dynamically imported).
  - `music-portfolio`:
    - Uses ScrambleText and timelines for idle/hover effects.

#### `useLockBodyScroll`

- **File**: `src/hooks/useLockBodyScroll.ts`
- **Purpose**:
  - Prevent background scroll when modals/menus are open, while cooperating with Lenis.
- **Behavior**:
  - On `isOpen=true`:
    - Captures current `scrollY`.
    - Uses `stop()` from `LenisContext` to pause smooth scrolling.
    - Applies:
      - `body { overflow: hidden; position: fixed; top: -scrollY; width: 100%; padding-right: scrollbarWidth }`.
      - `html { overflow: hidden; }`.
  - On cleanup:
    - Restores original styles.
    - Scrolls back to recorded `scrollY`.
    - Calls `start()` on Lenis.

Used in:
- Navbar mobile menu.
- Registration modals and any overlay UI that should lock scroll.

#### `useReferralCapture`

- **File**: `src/hooks/useReferralCapture.ts`
- **Purpose**:
  - Persist `?ref=` query parameter as a referral code.
- **Behavior**:
  - On mount:
    - Parses `window.location.search` for `ref`.
    - Writes to `localStorage` under a fixed key.
    - Calls `history.replaceState` to remove `ref` from the URL without reload.

#### `useNavbarScroll`

- **File**: `src/components/layout/Navbar/useNavbarScroll.ts`
- **Purpose**:
  - Non-reactive, highly-performant navbar show/hide logic driven by scroll direction.
- **Behavior**:
  - Attaches scroll listeners using either:
    - Lenis scroll events (preferred), or
    - Window `scroll` events as fallback.
  - Tracks:
    - Last scroll position.
    - Scroll direction and thresholds to avoid jitter.
  - Sets:
    - `data-scrolling-started`
    - `data-scrolling-top`
    - `data-scrolling-direction="up"|"down"`
  - CSS in `globals.css` uses these attributes to apply transforms/opacity changes, keeping React renders minimal.

---

### Animation System

The app uses a combination of GSAP, Framer Motion, Lenis, and Three.js.

#### GSAP

- **Where used** (via `useGSAP`):
  - `HighlightsCarousel`:
    - Builds an infinite, draggable carousel of highlight cards.
    - Uses custom `horizontalLoop` utility to maintain looping behavior.
    - Lazy-loads Draggable and Inertia plugins to avoid heavier bundles on initial load.
  - `EventsGrid`:
    - Staggered fade-in and translate animations for event cards as they scroll into view.
    - Integrates `ScrollTrigger` and respects reduced motion.
  - `music-portfolio`:
    - Uses ScrambleText for label hover effects.
    - Idle animation timeline for list items.
    - Basic parallax on background images.

#### Framer Motion

- Used in:
  - `LoadingScreen`:
    - Coordinates an intro animation with:
      - SVG logo drawing.
      - Background particle animations.
      - Stage-based transitions (`logo` → `hold` → `fade`).
  - `Tooltip` component:
    - Tooltip fades/expands using spring animations on open/close.

#### Lenis

- **Global smooth scrolling** via `LenisProvider`.
- Works with:
  - `useNavbarScroll` for scroll-aware nav.
  - `useLockBodyScroll` to gracefully handle overlays.
  - GSAP ticker integration so scroll and animations stay in sync when both are active.

#### React Three Fiber & Rapier

- `Lanyard` uses:
  - R3F for 3D rendering.
  - Rapier for physics-driven motion of the card and rope.
  - Carefully manages performance by:
    - Reducing physics timesteps on mobile.
    - Limiting updates on low-powered devices.

---

### Responsive Design & Breakpoints

The responsive behavior is a mix of:

- Tailwind utility classes:
  - `sm:`, `md:`, `lg:`, `xl:` classes for layout, typography, and visibility.
- Custom CSS in `globals.css`:
  - Uses CSS variables (`--nav-padding-*`, `--nav-logo-size`) with `clamp()` to create fluid layouts.
  - Media queries for:
    - Navbar transformations.
    - Stacking vs grid layouts for sections.
    - Hiding certain decorative elements on smaller viewports.
- Components:
  - Often make decisions based on viewport (e.g., hero video picks different sources for mobile vs desktop).

---

### Performance Optimizations

Key patterns used to keep the UX performant despite heavy visuals:

- **Lazy loading & conditional initialization**
  - Hero video (`HeroSection`):
    - Uses `IntersectionObserver` to delay `video.load()` until near the viewport.
    - Only starts playback after `canplay` event.
  - GSAP & plugins:
    - Loaded only on the client and only when needed using `useGSAP`.
    - Heavier plugins (`Draggable`, `InertiaPlugin`) are dynamically imported inside interaction components.
  - Loading screen:
    - `LoadingContext` + `sessionStorage` ensures the heavy intro is shown only once per browser session.

- **Render minimization**
  - `Navbar`, `HeroSection`, and various cards are wrapped in `React.memo`.
  - Scroll behavior is driven by DOM attributes rather than React state updates.
  - Tooltip and other animated overlays are portaled when necessary to avoid impact on document flow.

- **GPU & scroll optimizations**
  - Global CSS applies `will-change: transform`, `translateZ(0)`, and `backface-visibility: hidden` to major animated containers.
  - `body` is configured to avoid horizontal scrolling and to use touch-friendly scrolling on iOS.
  - Scrollbars are hidden to match design (WebKit and Firefox).

- **Graceful degradation**
  - `prefers-reduced-motion: reduce` media queries in CSS disable animations or adjust transitions for users who prefer reduced motion.
  - Components guard usage of browser APIs and animation libraries to avoid SSR/hydration issues (e.g., checking `typeof window !== 'undefined'` where necessary).

---

### Summary

The frontend of TKwebsite is a rich, animation-heavy Next.js App Router UI built on:

- A layered layout structure (`RootLayout` + section layouts) with global providers for auth, smooth scrolling, and loading UX.
- A set of reusable UI primitives (buttons, cards, tooltips, 3D lanyard) and large custom CSS design system that sits on top of Tailwind v4 and Shadcn tokens.
- Lightweight state management using React Contexts and custom hooks instead of a centralized store.
- An animation stack combining GSAP, Framer Motion, Lenis, and React Three Fiber, with careful lazy-loading and optimization to maintain performance.

All critical business logic and data mutations are offloaded to backend APIs; the frontend focuses on orchestrating flows, rendering state, and delivering a high-fidelity visual experience.

