## React Doctor Code Quality Report (per file)

This report is generated from the latest `react-doctor` run (`npx -y react-doctor@latest .`).

### How to read this

- **Severity**: `error` is most important, then `warning`.
- **Category**: rough area impacted (Accessibility, Next.js, Performance, State & Effects, etc.).
- **Message**: short summary of what to fix.

---

### app/register/layout.tsx

- **1 warning (Correctness)**
  - `react/no-danger` at line 40, col 9 — Do not use `dangerouslySetInnerHTML` prop. This can create XSS security issues; prefer composing JSX or sanitizing content on the server.

---

### src/components/sections/home/CTASection.tsx

- **1 warning (Next.js)**
  - `react-doctor/nextjs-no-img-element` at line 29, col 17 — Use `next/image` instead of `<img>` for automatic optimization, lazy loading, and responsive images.

---

### app/sana-arena/page.tsx

- **1 warning (Next.js)**
  - `react-doctor/nextjs-missing-metadata` at line 1, col 1 — Page without `metadata` export; add `export const metadata = { title, description }` for SEO.

---

### components/music-portfolio.tsx

- **5 warnings**
  - **State & Effects**
    - `react-doctor/no-effect-event-handler` at line 76, col 3 — `useEffect` simulating an event handler; move logic into an actual event handler (`onClick`, `onChange`, etc.).
  - **Performance**
    - `react-doctor/rerender-memo-with-default-value` at line 142, multiple columns — Default prop values `[]` and `{}` create new references each render; extract constants to module scope (e.g. `const EMPTY_ITEMS = []`).

---

### src/components/ui/SciFiCard.tsx

- **4 warnings (Accessibility)**
  - `jsx-a11y/click-events-have-key-events` at lines 42 and 83 — Clickable non-interactive elements must also handle keyboard events (`onKeyUp`, `onKeyDown`, or `onKeyPress`).
  - `jsx-a11y/no-static-element-interactions` at lines 42 and 83 — Static elements with event handlers need a `role` or should use semantic elements like `button`.

---

### app/register/success/page.tsx

- **3 warnings (Next.js)**
  - `react-doctor/nextjs-missing-metadata` at line 1, col 1 — Add `metadata` or `generateMetadata` for better SEO.
  - `react-doctor/nextjs-no-use-search-params-without-suspense` at line 10, col 24 — Wrap the component using `useSearchParams` in a `<Suspense>` boundary.
  - `react-doctor/nextjs-no-client-side-redirect` at line 16, col 7 — Client-side redirect inside `useEffect`; prefer `redirect()` in a server component or middleware.

---

### src/components/decorative/EditorialMotifs.tsx

- **1 warning (Correctness)**
  - `react-doctor/no-array-index-as-key` at line 18, col 7 — Avoid using array index `i` as React key; use a stable identifier instead.

---

### src/components/ui/Lightbox.tsx

- **4 warnings (Accessibility)**
  - `jsx-a11y/click-events-have-key-events` at lines 111 and 130 — Add keyboard event handlers to clickable non-interactive elements.
  - `jsx-a11y/no-static-element-interactions` at lines 111 and 130 — Add `role` or switch to semantic elements (`button`, `a`, etc.).

---

### src/components/decorative/AwardBadge.tsx

- **1 warning (Performance)**
  - `react-doctor/rendering-hydration-no-flicker` at line 26, col 5 — `useEffect(setState, [])` on mount can cause hydration flashes; consider `useSyncExternalStore` or `suppressHydrationWarning`.

---

### src/components/ui/Font1Text.tsx

- **1 warning (Next.js)**
  - `react-doctor/nextjs-no-img-element` at line 30, col 17 — Replace `<img>` with `next/image`.

---

### app/register/page.tsx

- **4 warnings (Next.js)**
  - `react-doctor/nextjs-missing-metadata` at line 1, col 1 — Add `metadata` or `generateMetadata`.
  - `react-doctor/nextjs-no-client-side-redirect` at lines 17, 23, and 25 — Move redirects out of `useEffect` to server components or middleware using `redirect()`.

---

### src/components/sections/proshows/CinematicHero.tsx

- **2 warnings (Next.js)**
  - `react-doctor/nextjs-no-img-element` at lines 51 and 58 — Use `next/image` instead of `<img>`.

---

### src/features/auth/AuthContext.tsx

- **1 warning (State & Effects)**
  - `react-doctor/no-cascading-set-state` at line 58, col 3 — 4 `setState` calls in a single `useEffect`; consider `useReducer` or deriving state.

---

### app/register/my-pass/page.tsx

- **4 warnings (State & Effects / Next.js)**
  - `react-doctor/nextjs-missing-metadata` at line 1, col 1 — Add `metadata` export.
  - `react-doctor/prefer-useReducer` at line 81, col 38 — Component `MyPassPage` has many `useState` calls; consider `useReducer`.
  - `react-doctor/no-cascading-set-state` at lines 90 and 136 — Multiple `setState` calls in single `useEffect`; refactor to `useReducer` or derived state.

---

### src/components/ui/parallax-floating-images.tsx

- **3 warnings (Bundle Size / Correctness)**
  - `react-doctor/use-lazy-motion` at line 4, col 1 — Import `m` from `LazyMotion` instead of `motion` to save bundle size.
  - `react-doctor/no-array-index-as-key` at line 119, col 21 — Avoid array index as key; use a stable id.

---

### Notes

- This file only lists a subset of files from the full diagnostics for readability.
- You can re-run React Doctor anytime with: `npx -y react-doctor@latest .`

