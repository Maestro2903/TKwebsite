## React Doctor Per-File Code Quality Report

Generated from the latest `react-doctor` diagnostics.

**Per-file score rule (custom heuristic):**
- Start at **100**.
- Subtract **10 points** for each `error`.
- Subtract **2 points** for each `warning`.
- Minimum score is **0**.

---

### `app/events-rules/page.tsx`

- **Score**: 94 / 100
- **Issues**: 0 errors, 3 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-missing-metadata`
  - Location: line 1, col 1
  - Message: Page without metadata or generateMetadata export — hurts SEO
  - Help: Add `export const metadata = { title: '...', description: '...' }` or `export async function generateMetadata()`

- **2. [WARNING | Correctness]**
  - Rule: `react-doctor/no-array-index-as-key`
  - Location: line 126, col 19
  - Message: Array index "i" used as key — causes bugs when list is reordered or filtered
  - Help: Use a stable unique identifier: `key={item.id}` or `key={item.slug}` — index keys break on reorder/filter

- **3. [WARNING | Correctness]**
  - Rule: `react-doctor/no-array-index-as-key`
  - Location: line 138, col 17
  - Message: Array index "i" used as key — causes bugs when list is reordered or filtered
  - Help: Use a stable unique identifier: `key={item.id}` or `key={item.slug}` — index keys break on reorder/filter


---

### `app/events/layout.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Correctness]**
  - Rule: `react/no-danger`
  - Location: line 40, col 9
  - Message: Do not use `dangerouslySetInnerHTML` prop
  - Help: `dangerouslySetInnerHTML` is a way to inject HTML into your React component. This is dangerous because it can easily lead to XSS vulnerabilities.


---

### `app/events/page.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-missing-metadata`
  - Location: line 1, col 1
  - Message: Page without metadata or generateMetadata export — hurts SEO
  - Help: Add `export const metadata = { title: '...', description: '...' }` or `export async function generateMetadata()`


---

### `app/layout.tsx`

- **Score**: 96 / 100
- **Issues**: 0 errors, 2 warnings

- **1. [WARNING | Correctness]**
  - Rule: `react/no-danger`
  - Location: line 126, col 9
  - Message: Do not use `dangerouslySetInnerHTML` prop
  - Help: `dangerouslySetInnerHTML` is a way to inject HTML into your React component. This is dangerous because it can easily lead to XSS vulnerabilities.

- **2. [WARNING | Correctness]**
  - Rule: `react/no-danger`
  - Location: line 130, col 9
  - Message: Do not use `dangerouslySetInnerHTML` prop
  - Help: `dangerouslySetInnerHTML` is a way to inject HTML into your React component. This is dangerous because it can easily lead to XSS vulnerabilities.


---

### `app/login/page.tsx`

- **Score**: 94 / 100
- **Issues**: 0 errors, 3 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-missing-metadata`
  - Location: line 1, col 1
  - Message: Page without metadata or generateMetadata export — hurts SEO
  - Help: Add `export const metadata = { title: '...', description: '...' }` or `export async function generateMetadata()`

- **2. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-client-side-redirect`
  - Location: line 33, col 7
  - Message: Client-side redirect in useEffect — use redirect() in a server component or middleware instead
  - Help: Use `redirect('/path')` from 'next/navigation' in a Server Component, or handle in middleware

- **3. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-a-element`
  - Location: line 196, col 19
  - Message: Use next/link instead of <a> for internal links — enables client-side navigation and prefetching
  - Help: `import Link from 'next/link'` — enables client-side navigation, prefetching, and preserves scroll position


---

### `app/page.tsx`

- **Score**: 96 / 100
- **Issues**: 0 errors, 2 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-missing-metadata`
  - Location: line 1, col 1
  - Message: Page without metadata or generateMetadata export — hurts SEO
  - Help: Add `export const metadata = { title: '...', description: '...' }` or `export async function generateMetadata()`

- **2. [WARNING | Performance]**
  - Rule: `react-doctor/no-usememo-simple-expression`
  - Location: line 27, col 23
  - Message: useMemo wrapping a trivially cheap expression — memo overhead exceeds the computation
  - Help: Remove useMemo — property access, math, and ternaries are already cheap without memoization


---

### `app/payment/callback/page.tsx`

- **Score**: 94 / 100
- **Issues**: 0 errors, 3 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-missing-metadata`
  - Location: line 1, col 1
  - Message: Page without metadata or generateMetadata export — hurts SEO
  - Help: Add `export const metadata = { title: '...', description: '...' }` or `export async function generateMetadata()`

- **2. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-use-search-params-without-suspense`
  - Location: line 9, col 24
  - Message: useSearchParams() requires a <Suspense> boundary — without one, the entire page bails out to client-side rendering
  - Help: Wrap the component using useSearchParams: `<Suspense fallback={<Skeleton />}><SearchComponent /></Suspense>`

- **3. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-client-side-redirect`
  - Location: line 73, col 7
  - Message: Client-side redirect in useEffect — use redirect() in a server component or middleware instead
  - Help: Use `redirect('/path')` from 'next/navigation' in a Server Component, or handle in middleware


---

### `app/payment/success/page.tsx`

- **Score**: 80 / 100
- **Issues**: 1 errors, 5 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-missing-metadata`
  - Location: line 1, col 1
  - Message: Page without metadata or generateMetadata export — hurts SEO
  - Help: Add `export const metadata = { title: '...', description: '...' }` or `export async function generateMetadata()`

- **2. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-use-search-params-without-suspense`
  - Location: line 10, col 24
  - Message: useSearchParams() requires a <Suspense> boundary — without one, the entire page bails out to client-side rendering
  - Help: Wrap the component using useSearchParams: `<Suspense fallback={<Skeleton />}><SearchComponent /></Suspense>`

- **3. [ERROR | State & Effects]**
  - Rule: `react-doctor/no-fetch-in-effect`
  - Location: line 14, col 3
  - Message: fetch() inside useEffect — use a data fetching library (react-query, SWR) or server component
  - Help: Use `useQuery()` from @tanstack/react-query, `useSWR()`, or fetch in a Server Component instead

- **4. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-cascading-set-state`
  - Location: line 14, col 3
  - Message: 5 setState calls in a single useEffect — consider using useReducer or deriving state
  - Help: Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`

- **5. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-client-fetch-for-server-data`
  - Location: line 14, col 3
  - Message: useEffect + fetch in a page/layout — fetch data server-side with a server component instead
  - Help: Remove 'use client' and fetch directly in the Server Component — no API round-trip, secrets stay on server

- **6. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-client-side-redirect`
  - Location: line 36, col 28
  - Message: Client-side redirect in useEffect — use redirect() in a server component or middleware instead
  - Help: Use `redirect('/path')` from 'next/navigation' in a Server Component, or handle in middleware


---

### `app/proshows/page.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-missing-metadata`
  - Location: line 1, col 1
  - Message: Page without metadata or generateMetadata export — hurts SEO
  - Help: Add `export const metadata = { title: '...', description: '...' }` or `export async function generateMetadata()`


---

### `app/register/layout.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Correctness]**
  - Rule: `react/no-danger`
  - Location: line 40, col 9
  - Message: Do not use `dangerouslySetInnerHTML` prop
  - Help: `dangerouslySetInnerHTML` is a way to inject HTML into your React component. This is dangerous because it can easily lead to XSS vulnerabilities.


---

### `app/register/my-pass/page.tsx`

- **Score**: 92 / 100
- **Issues**: 0 errors, 4 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-missing-metadata`
  - Location: line 1, col 1
  - Message: Page without metadata or generateMetadata export — hurts SEO
  - Help: Add `export const metadata = { title: '...', description: '...' }` or `export async function generateMetadata()`

- **2. [WARNING | State & Effects]**
  - Rule: `react-doctor/prefer-useReducer`
  - Location: line 81, col 38
  - Message: Component "MyPassPage" has 5 useState calls — consider useReducer for related state
  - Help: Group related state: `const [state, dispatch] = useReducer(reducer, { field1, field2, ... })`

- **3. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-cascading-set-state`
  - Location: line 90, col 3
  - Message: 4 setState calls in a single useEffect — consider using useReducer or deriving state
  - Help: Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`

- **4. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-cascading-set-state`
  - Location: line 136, col 3
  - Message: 3 setState calls in a single useEffect — consider using useReducer or deriving state
  - Help: Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`


---

### `app/register/page.tsx`

- **Score**: 92 / 100
- **Issues**: 0 errors, 4 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-missing-metadata`
  - Location: line 1, col 1
  - Message: Page without metadata or generateMetadata export — hurts SEO
  - Help: Add `export const metadata = { title: '...', description: '...' }` or `export async function generateMetadata()`

- **2. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-client-side-redirect`
  - Location: line 17, col 7
  - Message: Client-side redirect in useEffect — use redirect() in a server component or middleware instead
  - Help: Use `redirect('/path')` from 'next/navigation' in a Server Component, or handle in middleware

- **3. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-client-side-redirect`
  - Location: line 23, col 7
  - Message: Client-side redirect in useEffect — use redirect() in a server component or middleware instead
  - Help: Use `redirect('/path')` from 'next/navigation' in a Server Component, or handle in middleware

- **4. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-client-side-redirect`
  - Location: line 25, col 7
  - Message: Client-side redirect in useEffect — use redirect() in a server component or middleware instead
  - Help: Use `redirect('/path')` from 'next/navigation' in a Server Component, or handle in middleware


---

### `app/register/pass/page.tsx`

- **Score**: 92 / 100
- **Issues**: 0 errors, 4 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-missing-metadata`
  - Location: line 1, col 1
  - Message: Page without metadata or generateMetadata export — hurts SEO
  - Help: Add `export const metadata = { title: '...', description: '...' }` or `export async function generateMetadata()`

- **2. [WARNING | State & Effects]**
  - Rule: `react-doctor/prefer-useReducer`
  - Location: line 17, col 45
  - Message: Component "PassSelectionPage" has 8 useState calls — consider useReducer for related state
  - Help: Group related state: `const [state, dispatch] = useReducer(reducer, { field1, field2, ... })`

- **3. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-client-side-redirect`
  - Location: line 34, col 13
  - Message: Client-side redirect in useEffect — use redirect() in a server component or middleware instead
  - Help: Use `redirect('/path')` from 'next/navigation' in a Server Component, or handle in middleware

- **4. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-client-side-redirect`
  - Location: line 39, col 13
  - Message: Client-side redirect in useEffect — use redirect() in a server component or middleware instead
  - Help: Use `redirect('/path')` from 'next/navigation' in a Server Component, or handle in middleware


---

### `app/register/profile/page.tsx`

- **Score**: 80 / 100
- **Issues**: 0 errors, 10 warnings

- **1. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/label-has-associated-control`
  - Location: line 260, col 15
  - Message: A form label must be associated with a control.
  - Help: Either give the label a `htmlFor` attribute with the id of the associated control, or wrap the label around the control.

- **2. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/label-has-associated-control`
  - Location: line 280, col 15
  - Message: A form label must be associated with a control.
  - Help: Either give the label a `htmlFor` attribute with the id of the associated control, or wrap the label around the control.

- **3. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/label-has-associated-control`
  - Location: line 300, col 15
  - Message: A form label must be associated with a control.
  - Help: Either give the label a `htmlFor` attribute with the id of the associated control, or wrap the label around the control.

- **4. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/label-has-associated-control`
  - Location: line 321, col 15
  - Message: A form label must be associated with a control.
  - Help: Either give the label a `htmlFor` attribute with the id of the associated control, or wrap the label around the control.

- **5. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-missing-metadata`
  - Location: line 1, col 1
  - Message: Page without metadata or generateMetadata export — hurts SEO
  - Help: Add `export const metadata = { title: '...', description: '...' }` or `export async function generateMetadata()`

- **6. [WARNING | State & Effects]**
  - Rule: `react-doctor/prefer-useReducer`
  - Location: line 12, col 39
  - Message: Component "ProfilePage" has 6 useState calls — consider useReducer for related state
  - Help: Group related state: `const [state, dispatch] = useReducer(reducer, { field1, field2, ... })`

- **7. [WARNING | Architecture]**
  - Rule: `react-doctor/no-giant-component`
  - Location: line 12, col 25
  - Message: Component "ProfilePage" is 416 lines — consider breaking it into smaller focused components
  - Help: Extract logical sections into focused components: `<UserHeader />`, `<UserActions />`, etc.

- **8. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-client-side-redirect`
  - Location: line 32, col 7
  - Message: Client-side redirect in useEffect — use redirect() in a server component or middleware instead
  - Help: Use `redirect('/path')` from 'next/navigation' in a Server Component, or handle in middleware

- **9. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-client-side-redirect`
  - Location: line 38, col 7
  - Message: Client-side redirect in useEffect — use redirect() in a server component or middleware instead
  - Help: Use `redirect('/path')` from 'next/navigation' in a Server Component, or handle in middleware

- **10. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-img-element`
  - Location: line 349, col 25
  - Message: Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset
  - Help: `import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset


---

### `app/register/success/page.tsx`

- **Score**: 94 / 100
- **Issues**: 0 errors, 3 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-missing-metadata`
  - Location: line 1, col 1
  - Message: Page without metadata or generateMetadata export — hurts SEO
  - Help: Add `export const metadata = { title: '...', description: '...' }` or `export async function generateMetadata()`

- **2. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-use-search-params-without-suspense`
  - Location: line 10, col 24
  - Message: useSearchParams() requires a <Suspense> boundary — without one, the entire page bails out to client-side rendering
  - Help: Wrap the component using useSearchParams: `<Suspense fallback={<Skeleton />}><SearchComponent /></Suspense>`

- **3. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-client-side-redirect`
  - Location: line 16, col 7
  - Message: Client-side redirect in useEffect — use redirect() in a server component or middleware instead
  - Help: Use `redirect('/path')` from 'next/navigation' in a Server Component, or handle in middleware


---

### `app/sana-arena/page.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-missing-metadata`
  - Location: line 1, col 1
  - Message: Page without metadata or generateMetadata export — hurts SEO
  - Help: Add `export const metadata = { title: '...', description: '...' }` or `export async function generateMetadata()`


---

### `scripts/db/check-firestore-data.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/db/cross-check-payments-passes.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/db/deep-search-event.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/db/export-firestore.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/db/import-to-blaze.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/db/migrate-qr-codes.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/db/migrate-to-blaze.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/db/seed-mock-summit-countries.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/db/seed-test-data-blaze.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/db/update-day1-events.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/db/update-day1-tech-extra.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/db/update-day2-events.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/db/update-day3-events.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/db/update-event-timing.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/db/update-nontech-prize-pools.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/db/verify-event-timing.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/react-doctor/generate-report.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/setup/list-buckets.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/setup/set-storage-cors-confirmed.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/setup/set-storage-cors-exhaustive.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/setup/set-storage-cors-final.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/setup/set-storage-cors-json.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/setup/set-storage-cors-v3.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/setup/set-storage-cors-v4.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/setup/set-storage-cors.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/testing/find-cards.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/testing/inspect-pass-cards.js`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `scripts/testing/test-email-with-pdf.mjs`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `src/components/decorative/AwardBadge.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Performance]**
  - Rule: `react-doctor/rendering-hydration-no-flicker`
  - Location: line 26, col 5
  - Message: useEffect(setState, []) on mount causes a flash — consider useSyncExternalStore or suppressHydrationWarning
  - Help: Use `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` or add `suppressHydrationWarning` to the element


---

### `src/components/decorative/EditorialMotifs.tsx`

- **Score**: 94 / 100
- **Issues**: 0 errors, 3 warnings

- **1. [WARNING | Correctness]**
  - Rule: `react-doctor/no-array-index-as-key`
  - Location: line 18, col 7
  - Message: Array index "i" used as key — causes bugs when list is reordered or filtered
  - Help: Use a stable unique identifier: `key={item.id}` or `key={item.slug}` — index keys break on reorder/filter

- **2. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: EditorialDivider

- **3. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: MetadataRow


---

### `src/components/layout/Footer.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Correctness]**
  - Rule: `react-doctor/no-array-index-as-key`
  - Location: line 34, col 23
  - Message: Array index "i" used as key — causes bugs when list is reordered or filtered
  - Help: Use a stable unique identifier: `key={item.id}` or `key={item.slug}` — index keys break on reorder/filter


---

### `src/components/layout/Navbar/constants.ts`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: SOCIAL_LINKS


---

### `src/components/layout/Navbar/index.ts`

- **Score**: 92 / 100
- **Issues**: 0 errors, 4 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: useNavbarScroll

- **2. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: NAV_LINKS

- **3. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: SOCIAL_LINKS

- **4. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: MENU_ARROW_PATH


---

### `src/components/layout/Navbar/Navbar.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-img-element`
  - Location: line 59, col 17
  - Message: Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset
  - Help: `import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset


---

### `src/components/layout/Navbar/NavMenuOverlay.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-img-element`
  - Location: line 102, col 17
  - Message: Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset
  - Help: `import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset


---

### `src/components/sections/events/EditorialEventCard.tsx`

- **Score**: 96 / 100
- **Issues**: 0 errors, 2 warnings

- **1. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 104, col 9
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **2. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 104, col 10
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.


---

### `src/components/sections/events/EventCard.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `src/components/sections/events/EventCategorySwitch.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: EventCategory


---

### `src/components/sections/events/EventDetailsModal.tsx`

- **Score**: 90 / 100
- **Issues**: 0 errors, 5 warnings

- **1. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 113, col 5
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **2. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 129, col 7
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **3. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 129, col 8
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.

- **4. [WARNING | Performance]**
  - Rule: `react-doctor/rendering-hydration-no-flicker`
  - Location: line 31, col 3
  - Message: useEffect(setState, []) on mount causes a flash — consider useSyncExternalStore or suppressHydrationWarning
  - Help: Use `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` or add `suppressHydrationWarning` to the element

- **5. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-effect-event-handler`
  - Location: line 63, col 3
  - Message: useEffect simulating an event handler — move logic to an actual event handler instead
  - Help: Move the conditional logic into onClick, onChange, or onSubmit handlers directly


---

### `src/components/sections/events/EventsHero.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-img-element`
  - Location: line 16, col 9
  - Message: Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset
  - Help: `import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset


---

### `src/components/sections/home/AboutSection.tsx`

- **Score**: 94 / 100
- **Issues**: 0 errors, 3 warnings

- **1. [WARNING | Architecture]**
  - Rule: `react-doctor/no-giant-component`
  - Location: line 11, col 25
  - Message: Component "AboutSection" is 316 lines — consider breaking it into smaller focused components
  - Help: Extract logical sections into focused components: `<UserHeader />`, `<UserActions />`, etc.

- **2. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-a-element`
  - Location: line 156, col 13
  - Message: Use next/link instead of <a> for internal links — enables client-side navigation and prefetching
  - Help: `import Link from 'next/link'` — enables client-side navigation, prefetching, and preserves scroll position

- **3. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-img-element`
  - Location: line 234, col 11
  - Message: Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset
  - Help: `import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset


---

### `src/components/sections/home/CTASection.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-img-element`
  - Location: line 29, col 17
  - Message: Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset
  - Help: `import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset


---

### `src/components/sections/home/HeroSection.tsx`

- **Score**: 92 / 100
- **Issues**: 0 errors, 4 warnings

- **1. [WARNING | Performance]**
  - Rule: `react-doctor/no-usememo-simple-expression`
  - Location: line 31, col 26
  - Message: useMemo wrapping a trivially cheap expression — memo overhead exceeds the computation
  - Help: Remove useMemo — property access, math, and ternaries are already cheap without memoization

- **2. [WARNING | Performance]**
  - Rule: `react-doctor/no-usememo-simple-expression`
  - Location: line 32, col 22
  - Message: useMemo wrapping a trivially cheap expression — memo overhead exceeds the computation
  - Help: Remove useMemo — property access, math, and ternaries are already cheap without memoization

- **3. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-cascading-set-state`
  - Location: line 72, col 5
  - Message: 6 setState calls in a single useEffect — consider using useReducer or deriving state
  - Help: Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`

- **4. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-img-element`
  - Location: line 160, col 29
  - Message: Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset
  - Help: `import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset


---

### `src/components/sections/home/HighlightsCarousel.tsx`

- **Score**: 92 / 100
- **Issues**: 0 errors, 4 warnings

- **1. [WARNING | Architecture]**
  - Rule: `react-doctor/no-giant-component`
  - Location: line 11, col 25
  - Message: Component "HighlightsCarousel" is 485 lines — consider breaking it into smaller focused components
  - Help: Extract logical sections into focused components: `<UserHeader />`, `<UserActions />`, etc.

- **2. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-cascading-set-state`
  - Location: line 17, col 5
  - Message: 3 setState calls in a single useEffect — consider using useReducer or deriving state
  - Help: Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`

- **3. [WARNING | Correctness]**
  - Rule: `react-doctor/no-array-index-as-key`
  - Location: line 473, col 33
  - Message: Array index "index" used as key — causes bugs when list is reordered or filtered
  - Help: Use a stable unique identifier: `key={item.id}` or `key={item.slug}` — index keys break on reorder/filter

- **4. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `src/components/sections/home/MarqueeSection.tsx`

- **Score**: 92 / 100
- **Issues**: 0 errors, 4 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-img-element`
  - Location: line 82, col 33
  - Message: Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset
  - Help: `import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset

- **2. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-img-element`
  - Location: line 94, col 33
  - Message: Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset
  - Help: `import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset

- **3. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-img-element`
  - Location: line 145, col 33
  - Message: Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset
  - Help: `import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset

- **4. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-img-element`
  - Location: line 157, col 33
  - Message: Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset
  - Help: `import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset


---

### `src/components/sections/proshows/CinematicHero.tsx`

- **Score**: 96 / 100
- **Issues**: 0 errors, 2 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-img-element`
  - Location: line 51, col 13
  - Message: Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset
  - Help: `import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset

- **2. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-img-element`
  - Location: line 58, col 11
  - Message: Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset
  - Help: `import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset


---

### `src/components/sections/registration/AllAccessModal.tsx`

- **Score**: 76 / 100
- **Issues**: 1 errors, 7 warnings

- **1. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 300, col 9
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **2. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 310, col 13
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **3. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 310, col 14
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.

- **4. [WARNING | State & Effects]**
  - Rule: `react-doctor/prefer-useReducer`
  - Location: line 36, col 25
  - Message: Component "AllAccessModal" has 12 useState calls — consider useReducer for related state
  - Help: Group related state: `const [state, dispatch] = useReducer(reducer, { field1, field2, ... })`

- **5. [WARNING | Architecture]**
  - Rule: `react-doctor/no-giant-component`
  - Location: line 33, col 25
  - Message: Component "AllAccessModal" is 687 lines — consider breaking it into smaller focused components
  - Help: Extract logical sections into focused components: `<UserHeader />`, `<UserActions />`, etc.

- **6. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-cascading-set-state`
  - Location: line 57, col 5
  - Message: 8 setState calls in a single useEffect — consider using useReducer or deriving state
  - Help: Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`

- **7. [ERROR | State & Effects]**
  - Rule: `react-doctor/no-fetch-in-effect`
  - Location: line 98, col 5
  - Message: fetch() inside useEffect — use a data fetching library (react-query, SWR) or server component
  - Help: Use `useQuery()` from @tanstack/react-query, `useSWR()`, or fetch in a Server Component instead

- **8. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-cascading-set-state`
  - Location: line 98, col 5
  - Message: 5 setState calls in a single useEffect — consider using useReducer or deriving state
  - Help: Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`


---

### `src/components/sections/registration/CountrySelectionModal.tsx`

- **Score**: 88 / 100
- **Issues**: 0 errors, 6 warnings

- **1. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 100, col 5
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **2. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 104, col 7
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **3. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 100, col 6
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.

- **4. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 104, col 8
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.

- **5. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-effect-event-handler`
  - Location: line 51, col 3
  - Message: useEffect simulating an event handler — move logic to an actual event handler instead
  - Help: Move the conditional logic into onClick, onChange, or onSubmit handlers directly

- **6. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `src/components/sections/registration/DayPassModal.tsx`

- **Score**: 76 / 100
- **Issues**: 1 errors, 7 warnings

- **1. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 355, col 9
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **2. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 365, col 13
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **3. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 365, col 14
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.

- **4. [WARNING | State & Effects]**
  - Rule: `react-doctor/prefer-useReducer`
  - Location: line 45, col 23
  - Message: Component "DayPassModal" has 13 useState calls — consider useReducer for related state
  - Help: Group related state: `const [state, dispatch] = useReducer(reducer, { field1, field2, ... })`

- **5. [WARNING | Architecture]**
  - Rule: `react-doctor/no-giant-component`
  - Location: line 40, col 25
  - Message: Component "DayPassModal" is 796 lines — consider breaking it into smaller focused components
  - Help: Extract logical sections into focused components: `<UserHeader />`, `<UserActions />`, etc.

- **6. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-cascading-set-state`
  - Location: line 87, col 5
  - Message: 9 setState calls in a single useEffect — consider using useReducer or deriving state
  - Help: Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`

- **7. [ERROR | State & Effects]**
  - Rule: `react-doctor/no-fetch-in-effect`
  - Location: line 113, col 5
  - Message: fetch() inside useEffect — use a data fetching library (react-query, SWR) or server component
  - Help: Use `useQuery()` from @tanstack/react-query, `useSWR()`, or fetch in a Server Component instead

- **8. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-cascading-set-state`
  - Location: line 113, col 5
  - Message: 6 setState calls in a single useEffect — consider using useReducer or deriving state
  - Help: Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`


---

### `src/components/sections/registration/GroupRegistrationModal.tsx`

- **Score**: 78 / 100
- **Issues**: 1 errors, 6 warnings

- **1. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 293, col 9
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **2. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 303, col 13
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **3. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 303, col 14
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.

- **4. [WARNING | State & Effects]**
  - Rule: `react-doctor/prefer-useReducer`
  - Location: line 32, col 33
  - Message: Component "GroupRegistrationModal" has 12 useState calls — consider useReducer for related state
  - Help: Group related state: `const [state, dispatch] = useReducer(reducer, { field1, field2, ... })`

- **5. [WARNING | Architecture]**
  - Rule: `react-doctor/no-giant-component`
  - Location: line 29, col 25
  - Message: Component "GroupRegistrationModal" is 685 lines — consider breaking it into smaller focused components
  - Help: Extract logical sections into focused components: `<UserHeader />`, `<UserActions />`, etc.

- **6. [ERROR | State & Effects]**
  - Rule: `react-doctor/no-fetch-in-effect`
  - Location: line 62, col 5
  - Message: fetch() inside useEffect — use a data fetching library (react-query, SWR) or server component
  - Help: Use `useQuery()` from @tanstack/react-query, `useSWR()`, or fetch in a Server Component instead

- **7. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-cascading-set-state`
  - Location: line 62, col 5
  - Message: 13 setState calls in a single useEffect — consider using useReducer or deriving state
  - Help: Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`


---

### `src/components/sections/registration/PassSelectorModal.tsx`

- **Score**: 92 / 100
- **Issues**: 0 errors, 4 warnings

- **1. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 47, col 5
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **2. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 57, col 7
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **3. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 57, col 8
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.

- **4. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `src/components/sections/registration/ProshowModal.tsx`

- **Score**: 76 / 100
- **Issues**: 1 errors, 7 warnings

- **1. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 292, col 9
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **2. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 302, col 13
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **3. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 302, col 14
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.

- **4. [WARNING | State & Effects]**
  - Rule: `react-doctor/prefer-useReducer`
  - Location: line 32, col 23
  - Message: Component "ProshowModal" has 12 useState calls — consider useReducer for related state
  - Help: Group related state: `const [state, dispatch] = useReducer(reducer, { field1, field2, ... })`

- **5. [WARNING | Architecture]**
  - Rule: `react-doctor/no-giant-component`
  - Location: line 29, col 25
  - Message: Component "ProshowModal" is 666 lines — consider breaking it into smaller focused components
  - Help: Extract logical sections into focused components: `<UserHeader />`, `<UserActions />`, etc.

- **6. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-cascading-set-state`
  - Location: line 53, col 5
  - Message: 8 setState calls in a single useEffect — consider using useReducer or deriving state
  - Help: Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`

- **7. [ERROR | State & Effects]**
  - Rule: `react-doctor/no-fetch-in-effect`
  - Location: line 92, col 5
  - Message: fetch() inside useEffect — use a data fetching library (react-query, SWR) or server component
  - Help: Use `useQuery()` from @tanstack/react-query, `useSWR()`, or fetch in a Server Component instead

- **8. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-cascading-set-state`
  - Location: line 92, col 5
  - Message: 5 setState calls in a single useEffect — consider using useReducer or deriving state
  - Help: Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`


---

### `src/components/sections/registration/RegistrationFormModal.tsx`

- **Score**: 90 / 100
- **Issues**: 0 errors, 5 warnings

- **1. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 130, col 5
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **2. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 140, col 7
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **3. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 140, col 8
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.

- **4. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-cascading-set-state`
  - Location: line 29, col 3
  - Message: 3 setState calls in a single useEffect — consider using useReducer or deriving state
  - Help: Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`

- **5. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `src/components/sections/registration/RegistrationPassCard.tsx`

- **Score**: 94 / 100
- **Issues**: 0 errors, 3 warnings

- **1. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 138, col 17
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **2. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 138, col 18
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.

- **3. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `src/components/sections/registration/RegistrationPassesGrid.tsx`

- **Score**: 90 / 100
- **Issues**: 1 errors, 0 warnings

- **1. [ERROR | State & Effects]**
  - Rule: `react-doctor/no-fetch-in-effect`
  - Location: line 14, col 3
  - Message: fetch() inside useEffect — use a data fetching library (react-query, SWR) or server component
  - Help: Use `useQuery()` from @tanstack/react-query, `useSWR()`, or fetch in a Server Component instead


---

### `src/components/sections/registration/RegistrationStickyCTA.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `src/components/ui/Font1Text.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-img-element`
  - Location: line 30, col 17
  - Message: Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset
  - Help: `import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset


---

### `src/components/ui/glass-button.tsx`

- **Score**: 96 / 100
- **Issues**: 0 errors, 2 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: glassButtonVariants

- **2. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: GlassButtonProps


---

### `src/components/ui/Lanyard.tsx`

- **Score**: 58 / 100
- **Issues**: 0 errors, 21 warnings

- **1. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 363, col 23
  - Message: Unknown property found
  - Help: Remove unknown property

- **2. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 528, col 14
  - Message: Unknown property found
  - Help: Remove unknown property

- **3. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 548, col 13
  - Message: Unknown property found
  - Help: Remove unknown property

- **4. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 560, col 19
  - Message: Unknown property found
  - Help: Remove unknown property

- **5. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 562, col 17
  - Message: Unknown property found
  - Help: Remove unknown property

- **6. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 563, col 17
  - Message: Unknown property found
  - Help: Remove unknown property

- **7. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 564, col 17
  - Message: Unknown property found
  - Help: Remove unknown property

- **8. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 565, col 17
  - Message: Unknown property found
  - Help: Remove unknown property

- **9. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 566, col 17
  - Message: Unknown property found
  - Help: Remove unknown property

- **10. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 567, col 17
  - Message: Unknown property found
  - Help: Remove unknown property

- **11. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 570, col 19
  - Message: Unknown property found
  - Help: Remove unknown property

- **12. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 570, col 50
  - Message: Unknown property found
  - Help: Remove unknown property

- **13. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 570, col 77
  - Message: Unknown property found
  - Help: Remove unknown property

- **14. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 571, col 19
  - Message: Unknown property found
  - Help: Remove unknown property

- **15. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 571, col 51
  - Message: Unknown property found
  - Help: Remove unknown property

- **16. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 579, col 11
  - Message: Unknown property found
  - Help: Remove unknown property

- **17. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 580, col 11
  - Message: Unknown property found
  - Help: Remove unknown property

- **18. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 582, col 11
  - Message: Unknown property found
  - Help: Remove unknown property

- **19. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 583, col 11
  - Message: Unknown property found
  - Help: Remove unknown property

- **20. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 584, col 11
  - Message: Unknown property found
  - Help: Remove unknown property

- **21. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-effect-event-handler`
  - Location: line 482, col 3
  - Message: useEffect simulating an event handler — move logic to an actual event handler instead
  - Help: Move the conditional logic into onClick, onChange, or onSubmit handlers directly


---

### `src/components/ui/Lightbox.tsx`

- **Score**: 92 / 100
- **Issues**: 0 errors, 4 warnings

- **1. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 111, col 9
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **2. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 130, col 13
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **3. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 111, col 10
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.

- **4. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 130, col 14
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.


---

### `src/components/ui/LoadingScreen.tsx`

- **Score**: 92 / 100
- **Issues**: 0 errors, 4 warnings

- **1. [WARNING | Correctness]**
  - Rule: `react/no-danger`
  - Location: line 128, col 14
  - Message: Do not use `dangerouslySetInnerHTML` prop
  - Help: `dangerouslySetInnerHTML` is a way to inject HTML into your React component. This is dangerous because it can easily lead to XSS vulnerabilities.

- **2. [WARNING | Bundle Size]**
  - Rule: `react-doctor/use-lazy-motion`
  - Location: line 4, col 1
  - Message: Import "m" with LazyMotion instead of "motion" — saves ~30kb in bundle size
  - Help: Use `import { LazyMotion, m } from "framer-motion"` with `domAnimation` features — saves ~30kb

- **3. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-cascading-set-state`
  - Location: line 87, col 3
  - Message: 7 setState calls in a single useEffect — consider using useReducer or deriving state
  - Help: Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`

- **4. [WARNING | Correctness]**
  - Rule: `react-doctor/no-array-index-as-key`
  - Location: line 153, col 19
  - Message: Array index "i" used as key — causes bugs when list is reordered or filtered
  - Help: Use a stable unique identifier: `key={item.id}` or `key={item.slug}` — index keys break on reorder/filter


---

### `src/components/ui/music-artwork.tsx`

- **Score**: 86 / 100
- **Issues**: 0 errors, 7 warnings

- **1. [WARNING | Correctness]**
  - Rule: `react/no-unknown-property`
  - Location: line 134, col 14
  - Message: Unknown property found
  - Help: Remove unknown property

- **2. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 171, col 9
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **3. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 171, col 10
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.

- **4. [WARNING | State & Effects]**
  - Rule: `react-doctor/prefer-useReducer`
  - Location: line 45, col 23
  - Message: Component "MusicArtwork" has 5 useState calls — consider useReducer for related state
  - Help: Group related state: `const [state, dispatch] = useReducer(reducer, { field1, field2, ... })`

- **5. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-cascading-set-state`
  - Location: line 58, col 3
  - Message: 4 setState calls in a single useEffect — consider using useReducer or deriving state
  - Help: Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`

- **6. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-effect-event-handler`
  - Location: line 58, col 3
  - Message: useEffect simulating an event handler — move logic to an actual event handler instead
  - Help: Move the conditional logic into onClick, onChange, or onSubmit handlers directly

- **7. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `src/components/ui/music-portfolio.tsx`

- **Score**: 86 / 100
- **Issues**: 0 errors, 7 warnings

- **1. [WARNING | Performance]**
  - Rule: `react-doctor/rerender-memo-with-default-value`
  - Location: line 12, col 30
  - Message: Default prop value {} creates a new object reference every render — extract to a module-level constant
  - Help: Move to module scope: `const EMPTY_ITEMS: Item[] = []` then use as the default value

- **2. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-effect-event-handler`
  - Location: line 57, col 3
  - Message: useEffect simulating an event handler — move logic to an actual event handler instead
  - Help: Move the conditional logic into onClick, onChange, or onSubmit handlers directly

- **3. [WARNING | Performance]**
  - Rule: `react-doctor/rerender-memo-with-default-value`
  - Location: line 113, col 40
  - Message: Default prop value [] creates a new array reference every render — extract to a module-level constant
  - Help: Move to module scope: `const EMPTY_ITEMS: Item[] = []` then use as the default value

- **4. [WARNING | Performance]**
  - Rule: `react-doctor/rerender-memo-with-default-value`
  - Location: line 113, col 53
  - Message: Default prop value {} creates a new object reference every render — extract to a module-level constant
  - Help: Move to module scope: `const EMPTY_ITEMS: Item[] = []` then use as the default value

- **5. [WARNING | Performance]**
  - Rule: `react-doctor/rerender-memo-with-default-value`
  - Location: line 113, col 67
  - Message: Default prop value {} creates a new object reference every render — extract to a module-level constant
  - Help: Move to module scope: `const EMPTY_ITEMS: Item[] = []` then use as the default value

- **6. [WARNING | Performance]**
  - Rule: `react-doctor/rerender-memo-with-default-value`
  - Location: line 113, col 78
  - Message: Default prop value {} creates a new object reference every render — extract to a module-level constant
  - Help: Move to module scope: `const EMPTY_ITEMS: Item[] = []` then use as the default value

- **7. [WARNING | Performance]**
  - Rule: `react-doctor/rerender-memo-with-default-value`
  - Location: line 113, col 95
  - Message: Default prop value {} creates a new object reference every render — extract to a module-level constant
  - Help: Move to module scope: `const EMPTY_ITEMS: Item[] = []` then use as the default value


---

### `src/components/ui/MyPassCard.tsx`

- **Score**: 96 / 100
- **Issues**: 0 errors, 2 warnings

- **1. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-img-element`
  - Location: line 62, col 15
  - Message: Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset
  - Help: `import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset

- **2. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `src/components/ui/parallax-floating-images.tsx`

- **Score**: 94 / 100
- **Issues**: 0 errors, 3 warnings

- **1. [WARNING | Bundle Size]**
  - Rule: `react-doctor/use-lazy-motion`
  - Location: line 4, col 1
  - Message: Import "m" with LazyMotion instead of "motion" — saves ~30kb in bundle size
  - Help: Use `import { LazyMotion, m } from "framer-motion"` with `domAnimation` features — saves ~30kb

- **2. [WARNING | Correctness]**
  - Rule: `react-doctor/no-array-index-as-key`
  - Location: line 119, col 21
  - Message: Array index "i" used as key — causes bugs when list is reordered or filtered
  - Help: Use a stable unique identifier: `key={item.id}` or `key={item.slug}` — index keys break on reorder/filter

- **3. [WARNING | Next.js]**
  - Rule: `react-doctor/nextjs-no-img-element`
  - Location: line 168, col 13
  - Message: Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset
  - Help: `import Image from 'next/image'` — provides automatic WebP/AVIF, lazy loading, and responsive srcset


---

### `src/components/ui/PassCard.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: PassCardProps


---

### `src/components/ui/PassDetailsCard.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Correctness]**
  - Rule: `react-doctor/no-array-index-as-key`
  - Location: line 193, col 19
  - Message: Array index "i" used as key — causes bugs when list is reordered or filtered
  - Help: Use a stable unique identifier: `key={item.id}` or `key={item.slug}` — index keys break on reorder/filter


---

### `src/components/ui/SciFiCard.tsx`

- **Score**: 90 / 100
- **Issues**: 0 errors, 5 warnings

- **1. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 42, col 9
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **2. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 83, col 25
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **3. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 42, col 10
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.

- **4. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 83, col 26
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.

- **5. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `src/components/ui/scroll-area.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: ScrollBar


---

### `src/components/ui/tailwind-css-background-snippet.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: Hero


---

### `src/components/ui/tooltip-card.tsx`

- **Score**: 94 / 100
- **Issues**: 0 errors, 3 warnings

- **1. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 148, col 5
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **2. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 148, col 6
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.

- **3. [WARNING | Bundle Size]**
  - Rule: `react-doctor/use-lazy-motion`
  - Location: line 3, col 1
  - Message: Import "m" with LazyMotion instead of "motion" — saves ~30kb in bundle size
  - Help: Use `import { LazyMotion, m } from "framer-motion"` with `domAnimation` features — saves ~30kb


---

### `src/data/cinematic-proshows.ts`

- **Score**: 96 / 100
- **Issues**: 0 errors, 2 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: CINEMATIC_PROSHOWS

- **2. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: CinematicHeroData


---

### `src/data/proshows.ts`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/files`
  - Location: line 0, col 0
  - Message: Unused file
  - Help: This file is not imported by any other file in the project.


---

### `src/data/rules.ts`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: GENERAL_RULES


---

### `src/data/shows.ts`

- **Score**: 96 / 100
- **Issues**: 0 errors, 2 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: ShowItem

- **2. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: ShowDay


---

### `src/features/auth/AuthContext.tsx`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | State & Effects]**
  - Rule: `react-doctor/no-cascading-set-state`
  - Location: line 58, col 3
  - Message: 4 setState calls in a single useEffect — consider using useReducer or deriving state
  - Help: Combine into useReducer: `const [state, dispatch] = useReducer(reducer, initialState)`


---

### `src/features/email/emailService.ts`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: EmailData


---

### `src/features/passes/PassCardTicket.tsx`

- **Score**: 90 / 100
- **Issues**: 0 errors, 5 warnings

- **1. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/click-events-have-key-events`
  - Location: line 209, col 11
  - Message: Enforce a clickable non-interactive element has at least one keyboard event listener.
  - Help: Visible, non-interactive elements with click handlers must have one of `keyup`, `keydown`, or `keypress` listener.

- **2. [WARNING | Accessibility]**
  - Rule: `jsx-a11y/no-static-element-interactions`
  - Location: line 209, col 12
  - Message: Static HTML elements with event handlers require a role.
  - Help: Add a role attribute to this element, or use a semantic HTML element instead.

- **3. [WARNING | Correctness]**
  - Rule: `react-doctor/no-array-index-as-key`
  - Location: line 154, col 21
  - Message: Array index "i" used as key — causes bugs when list is reordered or filtered
  - Help: Use a stable unique identifier: `key={item.id}` or `key={item.slug}` — index keys break on reorder/filter

- **4. [WARNING | Correctness]**
  - Rule: `react-doctor/no-array-index-as-key`
  - Location: line 195, col 21
  - Message: Array index "i" used as key — causes bugs when list is reordered or filtered
  - Help: Use a stable unique identifier: `key={item.id}` or `key={item.slug}` — index keys break on reorder/filter

- **5. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: PassCardTicketProps


---

### `src/features/passes/qrService.ts`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: createSignedQR


---

### `src/features/payments/cashfreeClient.ts`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: CheckoutResult


---

### `src/hooks/useReferralCapture.ts`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: REFERRAL_STORAGE_KEY


---

### `src/lib/cache/eventsCache.ts`

- **Score**: 96 / 100
- **Issues**: 0 errors, 2 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: getCachedEventById

- **2. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: CachedEvent


---

### `src/lib/crypto/qrEncryption.ts`

- **Score**: 96 / 100
- **Issues**: 0 errors, 2 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: generateSecretKey

- **2. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: testEncryption


---

### `src/lib/db/firestoreTypes.ts`

- **Score**: 80 / 100
- **Issues**: 0 errors, 10 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: PaymentStatus

- **2. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: EventCategory

- **3. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: EventType

- **4. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: Event

- **5. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: EventAccess

- **6. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: Payment

- **7. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: TeamMember

- **8. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: Team

- **9. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: TeamSnapshot

- **10. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: Pass


---

### `src/lib/firebase/clientApp.ts`

- **Score**: 92 / 100
- **Issues**: 0 errors, 4 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: storage

- **2. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: getDbSafe

- **3. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: getStorageSafe

- **4. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: getDb


---

### `src/lib/security/rateLimiter.ts`

- **Score**: 98 / 100
- **Issues**: 0 errors, 1 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: rateLimit


---

### `src/lib/security/validation.ts`

- **Score**: 84 / 100
- **Issues**: 0 errors, 8 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: phoneSchema

- **2. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: nameSchema

- **3. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: collegeSchema

- **4. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: userProfileSchema

- **5. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: paymentInitiationSchema

- **6. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: validatePhone

- **7. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: validateName

- **8. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: validateCollege


---

### `src/lib/utils/eventConflicts.ts`

- **Score**: 90 / 100
- **Issues**: 0 errors, 5 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: parseTime

- **2. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: doTimesOverlap

- **3. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: doEventsConflict

- **4. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: getConflictingEventIds

- **5. [WARNING | Dead Code]**
  - Rule: `knip/exports`
  - Location: line 0, col 0
  - Message: Unused export: getConflictWarnings


---

### `src/types/passes.ts`

- **Score**: 92 / 100
- **Issues**: 0 errors, 4 warnings

- **1. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: PassTypeId

- **2. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: Pass

- **3. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: Team

- **4. [WARNING | Dead Code]**
  - Rule: `knip/types`
  - Location: line 0, col 0
  - Message: Unused type: Payment


---
