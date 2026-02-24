# Repository Architecture Summary

**Project:** CIT Takshashila 2026 — Inter-college cultural & technical fest website
**Stack:** Next.js 16 (App Router) + React 19 + Firebase (Auth/Firestore/Storage) + Cashfree Payments + Tailwind CSS 4 + TypeScript 5
**Deployment:** Vercel (serverless) — domain `cittakshashila.org`

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        NEXT.JS APP                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  MIDDLEWARE (middleware.ts)            │   │
│  │  - Blocks Vercel preview URLs from indexing           │   │
│  │  - Matches all routes except _next/static, images     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐    │
│  │  PAGES (CSR) │  │  LAYOUTS     │  │  API ROUTES    │    │
│  │  13 pages    │  │  6 layouts   │  │  18 endpoints  │    │
│  │  all 'use    │  │  root: SSR   │  │  server-side   │    │
│  │  client'     │  │  rest: SSR   │  │  only          │    │
│  └──────────────┘  └──────────────┘  └────────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               PROVIDER HIERARCHY                      │   │
│  │  html → body → LenisProvider → ClientLayout →         │   │
│  │    AuthProvider → AppContent(Navbar + children)        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐    │
│  │  src/lib/    │  │ src/features/│  │  src/data/     │    │
│  │  firebase    │  │  auth        │  │  events        │    │
│  │  security    │  │  passes      │  │  passes        │    │
│  │  crypto      │  │  payments    │  │  shows         │    │
│  │  cache       │  │  email       │  │  rules         │    │
│  │  utils       │  │              │  │                │    │
│  └──────────────┘  └──────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────┐    ┌──────────────┐    ┌──────────────────┐
│  FIREBASE   │    │   CASHFREE   │    │     RESEND       │
│  Auth       │    │   Payments   │    │   Email API      │
│  Firestore  │    │   Webhooks   │    │                  │
│  Storage    │    │              │    │                  │
└─────────────┘    └──────────────┘    └──────────────────┘
```

### Folder Structure (Key Directories)

```
TKwebsite/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, providers, navbar, SEO schemas)
│   ├── page.tsx                  # Home page (CSR)
│   ├── login/page.tsx            # Google sign-in
│   ├── register/                 # Registration flow
│   │   ├── page.tsx              # Smart redirect (→ profile or pass)
│   │   ├── profile/page.tsx      # Profile setup form
│   │   ├── pass/page.tsx         # Pass selection
│   │   ├── my-pass/page.tsx      # View passes + 3D lanyard + PDF download
│   │   └── success/page.tsx      # Post-payment countdown redirect
│   ├── payment/
│   │   ├── callback/page.tsx     # Cashfree callback → polls verify API
│   │   └── success/page.tsx      # Alternative success page
│   ├── events/page.tsx           # Events listing (tech/non-tech switch)
│   ├── events-rules/page.tsx     # Tabbed rules page
│   ├── proshows/page.tsx         # Cinematic proshows layout
│   ├── sana-arena/page.tsx       # Santhosh Narayanan concert page
│   ├── api/                      # 18 API route handlers
│   │   ├── payment/              # create-order, verify
│   │   ├── webhooks/cashfree/    # Webhook handler
│   │   ├── passes/               # qr, scan, scan-member, types, [passId]
│   │   ├── users/                # profile, passes, referral-code (stub)
│   │   ├── admin/                # fix-stuck-payment, reconcile-payments
│   │   ├── mock-summit/          # countries, assign-country
│   │   ├── events/               # list, invalidate cache
│   │   └── referral/apply/       # stub (404)
│   ├── robots.ts                 # Disallows /admin, /api, /payment, /register/my-pass
│   └── sitemap.ts                # 5 public URLs
├── src/
│   ├── lib/
│   │   ├── firebase/adminApp.ts  # Admin SDK singleton (PEM normalization)
│   │   ├── firebase/clientApp.ts # Client SDK singleton (browser-only guard)
│   │   ├── security/rateLimiter.ts  # In-memory IP rate limiter
│   │   ├── security/validation.ts   # Zod schemas + sanitization
│   │   ├── crypto/qrEncryption.ts   # AES-256-CBC for QR data
│   │   ├── cache/eventsCache.ts     # 5-min TTL server-side cache
│   │   ├── db/firestoreTypes.ts     # TypeScript interfaces for all collections
│   │   └── utils/                   # cn, svgConverter, eventConflicts
│   ├── features/
│   │   ├── auth/AuthContext.tsx      # AuthProvider + useAuth hook
│   │   ├── auth/authService.ts      # Google sign-in popup
│   │   ├── passes/qrService.ts      # HMAC-SHA256 QR signing/verification
│   │   ├── passes/pdfGenerator.client.ts  # Client-side PDF generation
│   │   ├── passes/pdfGenerator.server.ts  # Server-side PDF for email
│   │   ├── passes/PassCardTicket.tsx      # Ticket-styled pass card UI
│   │   ├── payments/cashfreeClient.ts     # Cashfree JS SDK wrapper
│   │   └── email/emailService.ts          # Resend email + HTML templates
│   ├── contexts/
│   │   ├── LenisContext.tsx         # Smooth scroll provider
│   │   └── LoadingContext.tsx       # Session-aware loading screen
│   ├── hooks/
│   │   ├── useGSAP.ts              # Lazy GSAP/ScrollTrigger/SplitText loader
│   │   ├── useReferralCapture.ts    # Captures ?ref= from URL
│   │   └── useLockBodyScroll.ts     # Modal body scroll lock (Lenis-aware)
│   ├── data/                        # Static data (events, passes, shows, rules)
│   ├── types/                       # passes.ts, cashfree.d.ts, meshline.d.ts
│   └── components/                  # UI: layout, sections, decorative, ui
├── middleware.ts                    # Vercel preview noindex
├── firestore.rules                  # Security rules
├── storage.rules                    # Storage rules (ID card uploads)
├── firebase.json                    # Firestore + Storage config
├── next.config.ts                   # COOP headers, image optimization, chunk splitting
├── scripts/                         # DB init/seed/debug, user management, testing
└── styles/globals.css               # Global styles
```

---

## 2. Critical Systems

These systems handle money, security, and data integrity. **Never modify without extreme caution.**

| System | Files | Risk Level |
|--------|-------|------------|
| **Payment Order Creation** | `api/payment/create-order/route.ts` | CRITICAL |
| **Payment Verification** | `api/payment/verify/route.ts` | CRITICAL |
| **Webhook Signature Verification** | `api/webhooks/cashfree/route.ts` | CRITICAL |
| **QR HMAC Signing** | `src/features/passes/qrService.ts` | CRITICAL |
| **QR AES-256 Encryption** | `src/lib/crypto/qrEncryption.ts` | CRITICAL |
| **Pass Scan (Organizer)** | `api/passes/scan/route.ts` | HIGH |
| **Member Check-in** | `api/passes/scan-member/route.ts` | HIGH |
| **Admin Recovery** | `api/admin/fix-stuck-payment/route.ts` | HIGH |
| **Firestore Security Rules** | `firestore.rules` | CRITICAL |
| **Firebase Admin Init** | `src/lib/firebase/adminApp.ts` | HIGH |
| **Auth Context** | `src/features/auth/AuthContext.tsx` | HIGH |
| **Validation Schemas** | `src/lib/security/validation.ts` | MEDIUM |
| **Rate Limiter** | `src/lib/security/rateLimiter.ts` | MEDIUM |

---

## 3. Data Flow Diagrams

### AUTH FLOW

```
User → /login → Google Sign-In Popup (Firebase Client SDK)
  → onAuthStateChanged fires
  → AuthContext checks Firestore users/{uid}
    → if exists: set userData, redirect to /register/pass
    → if not: set userData=null, redirect to /register/profile

API calls:
  Client gets idToken via user.getIdToken()
  → Sends as "Authorization: Bearer <idToken>"
  → Server: getAdminAuth().verifyIdToken(idToken) → decoded.uid
  → Server checks users/{uid}.isOrganizer for organizer-only routes
```

### PAYMENT FLOW

```
1. User selects pass → /register/pass
2. Client fills team/event data → calls POST /api/payment/create-order
   ├─ Validates: auth token, pass type, amount calculation, event rules
   ├─ Mock Summit: validates country assignment + access code
   ├─ Group Events: validates team size vs event min/max members
   ├─ Creates Cashfree order via API
   ├─ Writes payments/{orderId} doc (status: 'pending')
   ├─ For groups: creates teams/{teamId} doc
   └─ Returns { orderId, sessionId }

3. Client opens Cashfree checkout modal (cashfreeClient.ts)
   → User pays → Modal closes

4. Client redirects to /payment/callback?order_id=xxx
   → Calls POST /api/payment/verify (up to 3 retries)
   ├─ Polls Cashfree API (up to 5 attempts, 2s interval)
   ├─ Updates payment status → 'success'
   ├─ Transaction: creates passes/{passId} (idempotent)
   │   ├─ Encrypts QR data (AES-256-CBC)
   │   ├─ Generates QR code image (data URL)
   │   ├─ Computes eventAccess (tech/nonTech/proshowDays/fullAccess)
   │   ├─ For groups: snapshots team members into pass
   │   └─ Updates team with passId
   ├─ Generates PDF pass (server-side jsPDF)
   └─ Sends confirmation email (Resend) with PDF attachment

5. WEBHOOK (parallel path) POST /api/webhooks/cashfree
   ├─ HMAC-SHA256 signature verification (4 combos tried)
   ├─ Only processes PAYMENT_SUCCESS_WEBHOOK type
   ├─ Updates payment status → 'success'
   ├─ Transaction: creates pass (idempotent, won't duplicate)
   ├─ Uses qrService.createQRPayload (HMAC-signed, NOT AES-encrypted)
   └─ Sends email with PDF attachment

6. Admin recovery: POST /api/admin/fix-stuck-payment
   ├─ No auth guard (infrastructure-level protection needed)
   ├─ Confirms with Cashfree API if needed
   ├─ Transaction: creates pass if missing
   └─ Sends email
```

### QR & PASS SCANNING FLOW

```
TWO QR FORMATS exist in production:

Format 1 - AES-256-CBC Encrypted (from /api/payment/verify):
  encryptQRData({ id, name, passType, events, days })
  → "hexIV:hexCiphertext"
  → Scanned via decryptQRData() → extracts passId from .id field

Format 2 - HMAC-SHA256 Signed (from /api/webhooks/cashfree):
  createQRPayload(passId, userId, passType)
  → JSON.stringify({ passId, userId, passType, token: "passId:expiry.signature" })
  → Scanned: parse JSON → verifySignedQR(token) → extracts passId

Scanning:
  POST /api/passes/scan
  ├─ Auth required + isOrganizer check
  ├─ Tries signed token format first
  ├─ Falls back to encrypted format
  ├─ Checks pass exists + not already used
  └─ Updates: status='used', usedAt, scannedBy

  POST /api/passes/scan-member
  ├─ Auth required + isOrganizer check
  ├─ Takes { teamId, memberId }
  ├─ Checks member not already checked in
  └─ Atomic array update: arrayRemove old → arrayUnion updated
```

---

## 4. Auth & Security Overview

### Authentication

- **Client:** Firebase Auth (Google provider, popup mode)
- **Server:** Firebase Admin SDK `verifyIdToken()`
- **Token transport:** `Authorization: Bearer <idToken>` header
- **No session cookies** — stateless token-based auth

### Role-Based Access Control

- `users/{uid}.isOrganizer` boolean field (server-managed, cannot be set by client per Firestore rules)
- **Organizer-only APIs:** `/api/passes/scan`, `/api/passes/scan-member`
- **Owner-or-organizer:** `/api/passes/qr`, `/api/passes/[passId]`
- **Admin APIs:** `/api/admin/*` — no auth guard, relies on infrastructure protection

### Firestore Security Rules Summary

| Collection | Read | Create | Update | Delete |
|---|---|---|---|---|
| `users/{uid}` | Own only | Own (no isOrganizer) | Own (can't change isOrganizer) | N/A |
| `passes/{id}` | Owner OR organizer | Server only | Organizer only | Never |
| `teams/{id}` | Leader OR organizer | Server only | Organizer only | Never |
| `payments/{id}` | Owner only | Server only | Server only | Server only |
| `mockSummitAccessCodes` | Server only | Server only | Server only | Server only |
| `mockSummitCountries` | Public read | Server only | Server only | Server only |

### Storage Rules

- `users/{userId}/id_card` — read/write by own user only, max 2MB

### Rate Limiting

- In-memory per-IP limiter (resets per serverless instance)
- `/api/payment/create-order`: 5 req/min
- `/api/payment/verify`: 10 req/min
- `/api/passes/scan`: 10 req/min
- `/api/passes/scan-member`: 20 req/min
- `/api/users/profile POST`: 5 req/min
- Package `@upstash/ratelimit` + `@upstash/redis` are installed but **not currently used** — the in-memory limiter is active instead

### Input Validation

- Zod schemas: phone (Indian 10-digit), name (letters/spaces, 2-50), college (2-100, XSS-safe)
- `sanitizeInput()`: strips `<>`, `javascript:`, inline event handlers
- Payment amount validation: server recalculates expected amount from pass type + quantities

---

## 5. Payment & Pass Lifecycle

```
STATES:

Payment:  pending ──→ success ──→ (terminal)
                 └──→ failed  ──→ (terminal)

Pass:     paid ──→ used ──→ (terminal)

Team:     pending ──→ success (paymentStatus field)

LIFECYCLE:
┌──────────────────────────────────────────────────────────────┐
│ 1. CREATE ORDER                                              │
│    Payment doc created: status='pending'                     │
│    Team doc created (group only): status='pending'           │
│                                                              │
│ 2. PAYMENT CONFIRMED (verify API or webhook, whichever first)│
│    Payment doc updated: status='success'                     │
│    Pass doc created: status='paid', qrCode, eventAccess      │
│    Team doc updated: passId, paymentStatus='success'          │
│    Email sent with PDF attachment                            │
│    ⚠️ Transaction ensures exactly-once pass creation          │
│                                                              │
│ 3. SCAN AT VENUE (organizer)                                 │
│    Pass doc updated: status='used', usedAt, scannedBy        │
│    For groups: team members checked in individually           │
└──────────────────────────────────────────────────────────────┘
```

### Pass Types & Pricing

| Pass Type | ID | Price | Notes |
|---|---|---|---|
| Day Pass | `day_pass` | Rs.500/day | Can select 1-3 days |
| Group Events | `group_events` | Rs.250/person | Exactly 1 group event, team min/max enforced |
| Proshow | `proshow` | Rs.1500 | Day 1 + Day 3 only |
| All-Access (SaNa) | `sana_concert` | Rs.2000 | All 3 days + fullAccess flag |
| Mock Summit | `mock_summit` | Rs.0 | Free, requires access code + country assignment |

---

## 6. Firestore Schema Summary

```
Firestore Database
│
├── users/{uid}
│   ├── uid: string
│   ├── name: string
│   ├── email: string | null
│   ├── college: string
│   ├── phone: string
│   ├── idCardUrl: string (base64 data URL, stored inline)
│   ├── isOrganizer?: boolean (server-managed)
│   ├── createdAt: Timestamp
│   └── updatedAt?: Timestamp
│
├── payments/{orderId}
│   ├── userId: string
│   ├── amount: number
│   ├── passType: string
│   ├── cashfreeOrderId: string (= doc ID)
│   ├── status: 'pending' | 'success' | 'failed'
│   ├── customerDetails: { name, email, phone }
│   ├── teamId?: string
│   ├── teamMemberCount?: number
│   ├── selectedDays?: string[]
│   ├── selectedEvents: string[]
│   ├── mockSummitSelected?: boolean
│   ├── mockSummitAccessCode?: string
│   ├── countryId?: string
│   ├── countryName?: string
│   └── createdAt: Date
│
├── passes/{passId}
│   ├── userId: string
│   ├── passType: string
│   ├── amount: number
│   ├── paymentId: string (orderId)
│   ├── status: 'paid' | 'used'
│   ├── qrCode: string (data URL, ~10-50KB)
│   ├── selectedEvents: string[]
│   ├── selectedDays: string[]
│   ├── eventAccess: { tech, nonTech, proshowDays[], fullAccess }
│   ├── teamId?: string
│   ├── teamSnapshot?: { teamName, totalMembers, members[] }
│   ├── countryId?: string
│   ├── countryName?: string
│   ├── createdAt: Timestamp | Date
│   ├── usedAt?: Timestamp | Date
│   └── scannedBy?: string (organizer uid)
│
├── teams/{teamId}
│   ├── teamId: string
│   ├── teamName: string
│   ├── leaderId: string
│   ├── leaderName, leaderEmail, leaderPhone, leaderCollege: string
│   ├── members: TeamMember[]
│   │   └── { memberId, name, phone, email, isLeader,
│   │         attendance: { checkedIn, checkInTime, checkedInBy } }
│   ├── totalMembers: number
│   ├── totalAmount: number
│   ├── orderId: string
│   ├── passId?: string
│   ├── status: string
│   ├── paymentStatus: 'pending' | 'success'
│   └── createdAt, updatedAt: Date
│
├── events/{eventId}
│   ├── id, name, category, type, date, venue
│   ├── startTime?, endTime?, prizePool?, minMembers?, maxMembers?
│   ├── allowedPassTypes: PassType[]
│   ├── isActive: boolean
│   ├── description?, image?
│   └── createdAt, updatedAt: Timestamp
│
├── mockSummitCountries/{countryId}
│   ├── name: string
│   ├── assignedTo?: string (userId)
│   └── (readable by all, writable by server only)
│
├── mockSummitAccessCodes/{code}
│   ├── active: boolean
│   ├── maxUsage: number
│   ├── usedCount: number
│   └── expiresAt?: Timestamp
│
└── registrations/{doc} (LEGACY — read-only, no writes)
```

---

## 7. Potential Fragile Areas

### HIGH RISK

1. **Dual QR format inconsistency** — `verify` creates AES-encrypted QRs, `webhook` creates HMAC-signed QRs. The scan endpoint handles both, but if either format changes, the other path breaks silently. Any change to `qrEncryption.ts` or `qrService.ts` must account for both code paths.

2. **Race condition between verify and webhook** — Both can create a pass for the same payment. The Firestore transaction with `where('paymentId', '==', orderId)` check prevents duplicates, but if either path's transaction logic changes, double-pass creation is possible.

3. **Admin endpoints unprotected** — `/api/admin/fix-stuck-payment` and `/api/admin/reconcile-payments` have **no auth guards**. They rely on "infrastructure-level protection" which isn't implemented in code. `/api/events/invalidate` is also unprotected.

4. **ID card stored as base64 in Firestore** — `idCardUrl` is a base64 data URL stored inline in the `users` document. Large images could hit Firestore's 1MB document size limit. Storage rules exist for `users/{uid}/id_card` but the code stores base64 directly in Firestore, not in Storage.

5. **In-memory rate limiter on serverless** — The rate limiter uses an in-process `store` object. On Vercel, each serverless function instance has its own store, making it trivially bypassable across cold starts. `@upstash/ratelimit` is installed but unused.

### MEDIUM RISK

6. **No CSRF protection** on API routes — POST endpoints rely solely on Bearer token auth, which is fine for API-style calls but could be vulnerable if any form-based submissions exist.

7. **QR code data URL stored in Firestore** — Each pass stores a full QR code data URL (~10-50KB). This bloats document reads and bandwidth.

8. **scan-member uses non-atomic arrayRemove + arrayUnion** — Two separate `.update()` calls for member check-in. If the process crashes between remove and union, member data is lost.

9. **`createdTeamId` tracking in create-order** — The cleanup logic for orphan teams only works if `createdTeamId` is set, but team creation happens AFTER the Cashfree API call, so `createdTeamId` is always `null` in the catch block at line 275.

10. **Retry-After header bug** — In `rateLimiter.ts:57`, the calculation `Math.ceil(options?.windowMs || 60000 / 1000)` has operator precedence issue — `60000 / 1000` evaluates first, giving 60, but if `windowMs` is provided it returns the raw ms value (e.g., 60000) instead of seconds.

### LOW RISK

11. **All pages are CSR** — Every page uses `'use client'`. No SSR/SSG data fetching. This means no SEO for dynamic content (events, passes), though the static metadata exports help.

12. **`reactStrictMode: false`** — Disabled due to R3F WebGL context issues. May mask React bugs.

13. **Referral system is stubbed** — `/api/users/referral-code` and `/api/referral/apply` both return 404. `useReferralCapture` hook stores codes in localStorage but nothing consumes them.

---

## 8. Improvement Opportunities

| Area | Observation | Potential Improvement |
|---|---|---|
| **Rate Limiting** | In-memory store is per-instance, ineffective on Vercel | Switch to already-installed `@upstash/ratelimit` + `@upstash/redis` |
| **Admin API Security** | No auth on fix-stuck-payment, reconcile, events/invalidate | Add organizer auth check or API key validation |
| **QR Format Unification** | Two different QR formats from verify vs webhook | Standardize on one format (AES-encrypted recommended) |
| **scan-member Atomicity** | Two separate updates (arrayRemove then arrayUnion) | Use a single transaction or Firestore `runTransaction` |
| **ID Card Storage** | Base64 in Firestore doc (bloat risk) | Use Firebase Storage (rules already exist) |
| **Orphan Team Cleanup** | `createdTeamId` is always null in catch block | Move team creation before Cashfree API call, or fix tracking |
| **SSR/ISR** | All pages are CSR | Events & proshows pages could use ISR for SEO |
| **Environment Variables** | `.env.example` has a real-looking QR_ENCRYPTION_KEY | Ensure it's a placeholder, not a production key |
| **Referral System** | Hooks exist, API stubs return 404 | Either implement or remove dead code |
| **Retry-After Header** | Operator precedence bug in rateLimiter.ts:57 | Fix to `Math.ceil((options?.windowMs ?? 60000) / 1000)` |

---

## Environment Variables Map

| Variable | Used By | Type |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | clientApp.ts | Public |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | clientApp.ts | Public |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | clientApp.ts, adminApp.ts | Public |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | clientApp.ts | Public |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | clientApp.ts | Public |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | clientApp.ts | Public |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | adminApp.ts | Secret |
| `FIREBASE_ADMIN_PRIVATE_KEY` | adminApp.ts | Secret |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | adminApp.ts (alternative) | Secret |
| `CASHFREE_APP_ID` / `NEXT_PUBLIC_CASHFREE_APP_ID` | create-order, verify, webhook, admin | Secret |
| `CASHFREE_SECRET_KEY` | create-order, verify, webhook, admin | Secret |
| `CASHFREE_WEBHOOK_SECRET_KEY` | webhook | Secret |
| `NEXT_PUBLIC_CASHFREE_ENV` | cashfreeClient.ts, all payment APIs | Public |
| `RESEND_API_KEY` | emailService.ts | Secret |
| `QR_ENCRYPTION_KEY` | qrEncryption.ts (32 chars, AES-256) | Secret |
| `QR_SECRET_KEY` | qrService.ts (HMAC-SHA256) | Secret |
| `NEXT_PUBLIC_APP_URL` / `APP_URL` | create-order (return_url) | Public |
