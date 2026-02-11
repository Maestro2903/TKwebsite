## 1. Overview

This document describes the **scalability** and **performance** characteristics of the CIT Takshashila 2026 system, including:

- Current architecture strengths and limitations
- Frontend and backend optimizations
- Firestore indexing and cost considerations
- Recommended improvements as traffic grows

---

## 2. Current Architecture Characteristics

### 2.1 Strengths

- **Serverless compute**
  - Next.js API routes on Vercel scale horizontally by default.
  - No server instances to manage.

- **Managed database**
  - Firestore scales automatically with traffic and data size.
  - No manual sharding or capacity provisioning.

- **Static asset delivery**
  - Images, fonts, and other assets served via Vercel’s global CDN.
  - Next.js image optimization with AVIF/WebP reduces bandwidth.

- **Relatively small data set**
  - Typical fest scale (thousands to tens of thousands of users/passes) is well within Firestore and Vercel limits.

### 2.2 Limitations

- **In‑memory rate limiter**
  - Stored per serverless instance, not globally shared.
  - Can behave inconsistently under high concurrency or many instances.

- **No centralized caching layer**
  - All dynamic data fetched from Firestore (no Redis/edge cache).

- **No dedicated monitoring/alerting**
  - Relies on dashboards and manual checks; no automated alerts.

- **Email deliverability not optimized**
  - Uses Resend’s test sender by default; production domain DNS (SPF/DKIM) still needs configuration.

---

## 3. Frontend Performance

### 3.1 Bundling & Code Splitting

- Webpack config in `next.config.ts`:
  - `splitChunks: { chunks: 'all', maxSize: 200000 }`
  - Ensures:
    - No single chunk exceeds ~200KB.
    - Better browser caching and faster incremental loads.

- Dynamic imports:
  - Heavier sections (e.g. complex hero/3D sections, proshows schedules) are loaded lazily using `next/dynamic`.
  - Each dynamic import uses a minimal placeholder (div with `minHeight`) to avoid layout shifts.

### 3.2 Images & Media

- Next.js image optimization:
  - AVIF/WebP output.
  - Device-aware sizes.
  - 30‑day cache TTL (`minimumCacheTTL`).

- Media:
  - HLS.js for streaming video where needed.
  - Static hero/background videos compressed and served from `public/`.

### 3.3 Animations

- **Framer Motion**:
  - Used for simpler component‑level animations.
  - Plays nicely with React rendering lifecycle.

- **GSAP** (`useGSAP` hook):
  - Used for advanced scroll/sequence animations.
  - Integration takes care to avoid layout trashing.

- **Lenis**:
  - Smooth scrolling harnessed via `requestAnimationFrame`.
  - Implemented as a single instance for the app.

### 3.4 UX Optimizations

- Initial **loading screen**:
  - Runs once per session (uses `sessionStorage` to remember).
  - Reduces perceived wait on first page load.

- Sticky CTAs, clear navigation, and reduced friction:
  - Improve conversion without needing heavy client‑side logic.

---

## 4. Backend Performance & Scaling

### 4.1 API Routes

- Each API endpoint is stateless and can be scaled horizontally as traffic increases.
- Business logic is specific and cohesive:
  - **Payments**: only a few endpoints, each with limited responsibilities.
  - **Passes**: simple operations, mostly single document reads/writes.
  - **Users**: profile endpoints are lightweight.

### 4.2 Firestore Usage

Patterns:

- Small numbers of documents per user:
  - Profile: 1 doc.
  - Payments: typically 1 per purchase.
  - Passes: 1 per successful payment.
  - Teams: 1 per group registration.

- Queries:
  - **By userId**:
    - `passes` and `payments` filtered by `userId`.
  - **By paymentId / orderId**:
    - `payments` and `passes` filtered by `cashfreeOrderId` / `paymentId`.
  - Most operations are O(1) document reads/writes.

Firestore easily supports expected load for an event of this size.

### 4.3 Cashfree & Resend

- Cashfree:
  - Designed for high volume.
  - The app sends only a handful of requests per order:
    - `create order`
    - `verify order` (webhook + possibly verify call).

- Resend:
  - Transactional email provider built to handle bursts.
  - Emails sent only on meaningful events (payment success).

---

## 5. Indexing & Query Performance

See `DATABASE_SCHEMA.md` for details.

Key query:

- **List passes for user (“My Pass” page)**:

```ts
passesRef
  .where('userId', '==', uid)
  .where('status', '==', 'paid')   // sometimes used
  .orderBy('createdAt', 'desc');
```

Recommended composite index for production:

- Collection: `passes`
- Fields:
  - `userId` – ascending
  - `status` – ascending (if used in query)
  - `createdAt` – descending

Additional indexes:

- `payments.cashfreeOrderId` – single‑field index (auto‑created) suffices.
- `passes.paymentId` – single‑field index for idempotency checks.

Monitoring:

- Watch Firestore “index required” messages and add corresponding entries to `firestore.indexes.json`.

---

## 6. Cost & Resource Optimization

### 6.1 Firestore Reads/Writes

- Keep reads per user light:
  - Use targeted queries (`where('userId','==',uid)`) instead of scanning collections.
  - Avoid unnecessary reads in loops; batch wherever possible.

- Avoid client‑side writes to high‑churn documents:
  - `payments`, `passes`, `teams` writes are all **server‑only** via Admin SDK.

### 6.2 Network & Bandwidth

- Image optimization reduces total bandwidth.
- Dynamic imports reduce initial JS payloads.
- Serverless model ensures you only pay for actual request usage on Vercel.

---

## 7. Known Limitations

### 7.1 Rate Limiting

Current rate limiter:

- In‑memory state per serverless instance.
- Uses IP (`x-forwarded-for`) and a simple token bucket per route.

Limitations:

- Under heavy load and many instances:
  - Rate limit may not be enforced globally.
  - Abuse from distributed IPs is not mitigated.

**Improvement path:**

- Migrate to a shared, external store such as:
  - Upstash Redis.
  - Cloudflare KV/Workers KV (if moved).
  - Firestore‑based counters (with care).

### 7.2 Error Tracking & Alerting

- No centralized error tracker (like Sentry) is currently integrated.
- No alerting when error rates spike or when webhooks fail frequently.

### 7.3 Email & Deliverability

- Default sender is `onboarding@resend.dev`:
  - Suitable for test/dev.
  - For high‑volume or production scenarios:
    - Use a custom verified domain.
    - Configure SPF/DKIM.

### 7.4 Legacy Structures

- `registrations` collection is legacy and not used in new flows.
  - Adds complexity; can be migrated or archived in future refactors.

---

## 8. Future Improvements

### 8.1 Backend & Data

- Introduce **Redis/Upstash** for:
  - Distributed rate limiting.
  - Caching frequently accessed read‑only data (e.g. pass types, events).

- Implement **server‑side caching**:
  - Cache static data responses in memory or Redis with TTLs.
  - Decrease Firestore reads for hot paths.

- Add **soft deletion** or archival strategies:
  - Archive old `payments` and `passes` after the fest to a cheaper store.

### 8.2 Observability

- Integrate **Sentry** (or similar) for:
  - API error aggregation.
  - Frontend JS error tracking.

- Set up **monitoring & alerting**:
  - Alert on high error ratios on key endpoints:
    - `/api/payment/create-order`
    - `/api/payment/verify`
    - `/api/webhooks/cashfree`
  - Alert on long webhook delays or failures from Cashfree.

### 8.3 Frontend Experience

- Consider **PWA** features:
  - Offline caching of passes & QR codes.
  - “Add to Home Screen” for easier gate scanning.

- Introduce **code‑splitting boundaries** informed by analytics:
  - Fine‑tune dynamic imports based on user flows.

### 8.4 Testing & Reliability

- Add automated tests:
  - Unit tests for validation and QR signing logic.
  - Integration tests for payment and pass workflows (mocking Cashfree/Resend).
  - E2E tests for key flows (e.g. Playwright/Cypress).

---

## 9. Summary

- The system is well‑suited for the expected traffic of an annual fest and can scale horizontally with minimal changes due to its **serverless** + **managed database** architecture.
- Major scalability concerns lie less in raw capacity and more in:
  - Global rate limiting,
  - Observability and alerting,
  - Operational maturity (backups, error tracking).

As the event grows or usage patterns change, prioritize:

1. Distributed rate limiting and caching.
2. Centralized error tracking and monitoring.
3. Progressive enhancements (PWA/offline, improved tests) for reliability and UX.

