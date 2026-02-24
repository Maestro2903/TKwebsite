## Firestore Schema Documentation

This document describes the Firestore data model used by the TKwebsite application, based on:

- `src/lib/db/firestoreTypes.ts`
- `firestore.rules`
- All Firestore read/write usage in `app/api/**` and `src/features/**`.

Only collections and fields actually used in the codebase are documented.

---

### Collections Overview

The application uses the following collections:

- `events`
- `appUsers`
- `users`
- `payments`
- `passes`
- `teams`
- `mockSummitCountries`
- `mockSummitAccessCodes`
- `registrations`

Below, each collection is described with its fields, type, and relationships.

---

### `events` Collection

**Documents**: `events/{eventId}`

**Type**: `Event` from `src/lib/db/firestoreTypes.ts`

| Field            | Type                         | Required | Source / Usage                                         | Notes |
|------------------|------------------------------|----------|--------------------------------------------------------|-------|
| `id`             | `string`                     | Yes      | `firestoreTypes.Event.id`; matches document ID         | Used by event APIs and payment validation. |
| `name`           | `string`                     | Yes      | UI (`/events`, registration flows)                     | Human-readable name. |
| `category`       | `'technical' \| 'non_technical'` | Yes | `EventCategory`                                        | Drives tech/non-tech access flags on passes. |
| `type`           | `'individual' \| 'group' \| 'workshop'` | Yes | Payment validation for `group_events` passes           | Ensures group passes only target group events. |
| `date`           | `string` (ISO, e.g. `"2026-02-26"`) | Yes | Used for day-pass and proshow validation               | Controls `selectedDays` checks. |
| `venue`          | `string`                     | Yes      | Display in event UI                                   |      |
| `startTime`      | `string` (optional)          | No       | Additional display                                    | e.g. `"10:30 AM"`. |
| `endTime`        | `string` (optional)          | No       | Additional display                                    | e.g. `"2:00 PM"`. |
| `prizePool`      | `number` (optional)          | No       | UI                                                     |      |
| `minMembers`     | `number` (optional)          | No       | Group pass validation                                  | Minimum team size for group events. |
| `maxMembers`     | `number` (optional)          | No       | Group pass validation                                  | Maximum team size. |
| `allowedPassTypes` | `PassType[]` (`'day_pass'`, `'group_events'`, `'proshow'`, `'sana_concert'`, `'mock_summit'`) | Yes | Payment validation                                     | Each pass type’s allowed events. |
| `isActive`       | `boolean`                    | Yes      | `eventsCache` and `/api/events`                       | Inactive events filtered out. |
| `description`    | `string` (optional)          | No       | UI                                                     |      |
| `image`          | `string` (optional)          | No       | UI image URL                                          |      |
| `createdAt`      | `Timestamp \| Date`          | Yes      | Backend writes                                         | Stored when admin seeds events. |
| `updatedAt`      | `Timestamp \| Date`          | Yes      | Backend writes                                         |      |

**Relationships**:
- Events are referenced by:
  - `payments.selectedEvents`
  - `passes.selectedEvents`
- Event metadata drives:
  - Pass validation rules.
  - `eventAccess` fields on `passes`.

---

### `appUsers` Collection

**Documents**: `appUsers/{userId}`

**Purpose**: Client-visible profile data used by the frontend `AuthContext`. Strongly constrained by Firestore rules.

**Fields (from usage in `AuthContext` and `firestore.rules`)**:

| Field        | Type                                     | Required | Source / Usage                                      | Notes |
|--------------|------------------------------------------|----------|-----------------------------------------------------|-------|
| `uid`        | `string`                                 | Yes      | Written by `AuthContext.updateUserProfile`         | Document ID mirrors `uid`. |
| `name`       | `string`                                 | Yes      | Same as server `users` profile                     |      |
| `email`      | `string \| null`                         | Yes      | Same as server `users` profile                     |      |
| `college`    | `string`                                 | Yes      | Same as server `users` profile                     |      |
| `phone`      | `string`                                 | Yes      | Same as server `users` profile                     |      |
| `idCardUrl`  | `string`                                 | Yes      | URL in Firebase Storage                            | Uploaded client-side. |
| `isOrganizer`| `boolean` (optional)                     | No       | Managed server-side only                           | Clients are forbidden to set/modify this. |
| `createdAt`  | `Timestamp \| { toDate(): Date }`        | Yes      | Client writes `serverTimestamp` when creating      |      |

**Security rules** (`firestore.rules`):

- `allow read` if `request.auth.uid == userId`.
- `allow create` if:
  - `request.auth.uid == userId` and
  - `isOrganizer` is **absent or false**.
- `allow update` if:
  - `request.auth.uid == userId` and
  - The diff does **not** touch `isOrganizer`.
- `allow delete`: not explicitly allowed.

**Implications**:

- Organizer flag is effectively **server-controlled** and cannot be escalated from the client.
- Client uses this collection primarily for profile display; organizer checks for APIs use the server-side `users` collection (`isOrganizer` there).

---

### `users` Collection

**Documents**: `users/{uid}`

**Purpose**: Server-authored, canonical user profiles, including organizer role flag, used by backend APIs.

**Type**: `UserProfile` in `src/lib/db/firestoreTypes.ts`

| Field        | Type                                  | Required | Source / Usage                                 | Notes |
|--------------|---------------------------------------|----------|-----------------------------------------------|-------|
| `uid`        | `string`                              | Yes      | Key for linkage to auth user                  | Document ID mirrors `uid`. |
| `name`       | `string`                              | Yes      | `/api/users/profile` POST                     |      |
| `email`      | `string \| null`                      | Yes      | Derived from authenticated user or body       | Used for emails. |
| `college`    | `string`                              | Yes      | `/api/users/profile` POST                     |      |
| `phone`      | `string`                              | Yes      | `/api/users/profile` POST                     |      |
| `idCardUrl`  | `string`                              | Yes      | Set when profile is completed                 | Same as `appUsers`. |
| `isOrganizer`| `boolean` (optional)                  | No       | Server logic; used for organizer authz        | APIs check this flag. |
| `createdAt`  | `Timestamp \| { toDate(): Date }`     | Yes      | Set on first creation via Admin SDK           |      |
| `updatedAt`  | `Timestamp \| Date` (optional)        | No       | Set on modifications                          |      |

**Usage**:

- Read in:
  - `/api/users/profile` (GET/POST).
  - `/api/passes/[passId]`, `/api/passes/qr`, `/api/passes/scan`, `/api/passes/scan-member` for organizer checks.
  - Payment verification and admin fix routes to obtain `name`, `email`, `college`, `phone` for emails and QR payloads.

**Security rules**:

- `users` collection is **not** directly mentioned in `firestore.rules`; the intent is that it is server-only (no client access via SDK).
  - All access occurs via Firebase Admin SDK in API routes.

---

### `payments` Collection

**Documents**: `payments/{paymentId}`

**Type**: `Payment` from `firestoreTypes.ts` plus a few extra fields from payment creation.

| Field             | Type                                | Required | Source / Usage                                         | Notes |
|-------------------|-------------------------------------|----------|--------------------------------------------------------|-------|
| `userId`          | `string`                            | Yes      | `/api/payment/create-order`                           | Links to `users` & `appUsers`. |
| `amount`          | `number`                            | Yes      | Derived from validated pass and events                | Total purchase amount. |
| `passType`        | `string`                            | Yes      | Pass id from `PASS_TYPES`                             | e.g. `'day_pass'`, `'group_events'`. |
| `cashfreeOrderId` | `string`                            | Yes      | `orderId` used with Cashfree                          | Document ID is also `orderId`. |
| `status`          | `'pending' \| 'success' \| 'failed'`| Yes      | Initially `'pending'`, updated on webhook/verify      | `failed` not currently used in code. |
| `createdAt`       | `Timestamp \| Date`                 | Yes      | `new Date()` in `create-order`                        | Local server timestamp. |
| `updatedAt`       | `Timestamp \| Date` (optional)      | No       | Set on success in webhook/verify/admin-fix            |      |
| `customerDetails` | `{ name: string; email: string; phone: string }` | Yes | For referencing purchaser contact details             |      |
| `teamId`          | `string \| null`                    | No       | Set when passType is `group_events`                   | Links to `teams` doc. |
| `teamMemberCount` | `number \| null`                    | No       | Current team size                                      | Used for validation / display. |
| `selectedDays`    | `string[] \| null`                  | No       | Dates selected for day pass / proshow                 | Used to compute `eventAccess`. |
| `selectedEvents`  | `string[]`                          | Yes      | Event IDs from `events`                               | Central to access & validation. |
| `mockSummitSelected` | `boolean` (optional)             | No       | Set if `'mock-global-summit'` is included             |      |
| `mockSummitAccessCode` | `string \| null` (optional)    | No       | Validated access code used                            |      |
| `countryId`       | `string` (optional)                | No       | Selected country for mock summit                      |      |
| `countryName`     | `string` (optional)                | No       | Display name                                          |      |

**Security rules**:

- `match /payments/{paymentId}`:
  - `allow read` if `resource.data.userId == request.auth.uid`.
  - `allow create, update, delete: if false` – server-only via Admin SDK.

**Relationships**:

- `payments.userId → users.uid`.
- `payments.selectedEvents[] → events.id`.
- `payments.countryId → mockSummitCountries.id`.
- Used as the **source of truth** for:
  - Verifying payment success.
  - Creating `passes` and populating `teamSnapshot`.

---

### `passes` Collection

**Documents**: `passes/{passId}`

**Type**: `Pass` from `firestoreTypes.ts`, with additional optional fields used in QR and mock summit flows.

| Field           | Type                                      | Required | Source / Usage                                      | Notes |
|-----------------|-------------------------------------------|----------|-----------------------------------------------------|-------|
| `userId`        | `string`                                  | Yes      | Created in payment/webhook/admin flows             | Pass owner. |
| `passType`      | `string`                                  | Yes      | From `payments.passType`                           |      |
| `amount`        | `number`                                  | Yes      | From `payments.amount`                             |      |
| `paymentId`     | `string`                                  | Yes      | Corresponds to `payments.cashfreeOrderId`          | Used to prevent duplicates. |
| `status`        | `'paid' \| 'used'`                        | Yes      | `'paid'` when created; `'used'` after scan         |      |
| `qrCode`        | `string` (Data URL)                       | Yes      | Generated on server using `qrcode` library         | Encodes signed or encrypted payload. |
| `createdAt`     | `Timestamp \| Date`                       | Yes      | Server timestamp at creation                        |      |
| `usedAt`        | `Timestamp \| Date` (optional)            | No       | Set by `/api/passes/scan`                          | Marks entry. |
| `scannedBy`     | `string` (organizer UID, optional)        | No       | Set by `/api/passes/scan`                          | Audit trail for scan. |
| `selectedEvents`| `string[]`                                | Yes      | From `payments.selectedEvents`                     | For access and display. |
| `selectedDays`  | `string[]`                                | Yes      | From `payments.selectedDays`                        | For access and display. |
| `eventAccess`   | `{ tech: boolean; nonTech: boolean; proshowDays: string[]; fullAccess: boolean }` | Yes | Derived from events at pass creation | Controls allowed categories and proshow days. |
| `teamId`        | `string` (optional)                       | No       | For group passes                                   | Links to `teams`. |
| `teamSnapshot`  | `{ teamName: string; totalMembers: number; members: { memberId; name; phone; isLeader; checkedIn }[] }` (optional) | No | Immutable snapshot of team at payment time | `checkedIn` initially `false` for all members. |
| `countryId`     | `string` (optional)                       | No       | Propagated from `payments.countryId`               | For mock summit. |
| `countryName`   | `string` (optional)                       | No       | Propagated from `payments.countryName`             |      |

**Security rules**:

- `match /passes/{passId}`:
  - `allow read` if:
    - `resource.data.userId == request.auth.uid`, or
    - `appUsers/{request.auth.uid}.isOrganizer == true`.
  - `allow create: if false` – server-only.
  - `allow update` only if `appUsers/{uid}.isOrganizer == true`.
  - `allow delete: if false`.

**Relationships**:

- `passes.userId → users/appUsers`.
- `passes.paymentId → payments.cashfreeOrderId`.
- `passes.teamId → teams`.

---

### `teams` Collection

**Documents**: `teams/{teamId}`

**Type**: `Team` from `firestoreTypes.ts`, extended in `create-order` and later updates.

| Field         | Type                                      | Required | Source / Usage                                  | Notes |
|---------------|-------------------------------------------|----------|-------------------------------------------------|-------|
| `teamId`      | `string`                                  | Yes      | Id supplied by frontend                         | Also the doc id. |
| `teamName`    | `string`                                  | Yes      | Derived from request or leader name             |      |
| `leaderId`    | `string`                                  | Yes      | `userId` of the account creating the team       |      |
| `leaderName`  | `string`                                  | Yes      | From `teamData`                                 |      |
| `leaderEmail` | `string`                                  | Yes      | From `teamData`                                 |      |
| `leaderPhone` | `string`                                  | Yes      | Normalized phone                                |      |
| `leaderCollege` | `string`                                | Yes      | From request                                    |      |
| `passId`      | `string` (optional)                       | No       | Filled once pass is created                     | Used in admin & reconciliation. |
| `members`     | `TeamMember[]`                            | Yes      | Built in `create-order`                         | Includes leader + members. |
| `totalMembers`| `number`                                  | Yes      | Derived from `members.length`                   |      |
| `totalAmount` | `number`                                  | Yes      | Payment amount                                  |      |
| `status`      | `string` (e.g., `'pending'`)              | Yes      | Set in `create-order`                           |      |
| `orderId`     | `string`                                  | Yes      | Cashfree order id                               |      |
| `paymentStatus` | `string` (e.g., `'pending'`, `'success'`)| Yes      | Updated on webhook/verify/admin-fix             |      |
| `createdAt`   | `Timestamp \| Date`                       | Yes      | `new Date()` at creation                        |      |
| `updatedAt`   | `Timestamp \| Date`                       | Yes      | On each change                                  |      |

`TeamMember` structure (`firestoreTypes.ts`):

| Field           | Type                      | Required | Notes                                  |
|-----------------|---------------------------|----------|----------------------------------------|
| `memberId`      | `string`                  | Yes      | Unique per member within team.         |
| `name`          | `string`                  | Yes      |                                        |
| `phone`         | `string`                  | Yes      |                                        |
| `email`         | `string`                  | Yes      |                                        |
| `isLeader`      | `boolean`                 | Yes      | Marks team leader.                     |
| `attendance`    | `{ checkedIn: boolean; checkInTime: Timestamp \| null; checkedInBy: string \| null }` | Yes | Check-in tracking (organizer side). |

**Security rules**:

- `match /teams/{teamId}`:
  - `allow read` if:
    - `leaderId == request.auth.uid`, or
    - `appUsers/{uid}.isOrganizer == true`.
  - `allow create, delete: if false`.
  - `allow update` only for organizers (via `appUsers.isOrganizer`).

**Relationships**:

- `teams.leaderId → users/appUsers`.
- `teams.passId → passes`.
- `teams.orderId → payments`.

---

### `mockSummitCountries` Collection

**Documents**: `mockSummitCountries/{countryId}`

**Purpose**: Track Mock Global Summit country assignments per user.

**Fields (inferred from code)**:

| Field        | Type              | Required | Source / Usage                                   | Notes |
|--------------|-------------------|----------|--------------------------------------------------|-------|
| `name`       | `string`          | Yes      | Display name of country                          |      |
| `assignedTo` | `string \| null`  | Yes      | UID of user assigned to this country, or null    | Validated in `create-order` and `assign-country`. |

Additional fields may exist but are not referenced in code.

**Usage**:

- In `/api/payment/create-order`:
  - For mock summit events, validates:
    - `countryId` exists and `assignedTo == userId`.
  - Copies `countryId` and `countryName` to `payments`, then to `passes`.
- In `/api/mock-summit/assign-country`:
  - Transactionally sets `assignedTo` for a given user.

**Security rules**:

- Not explicitly listed in `firestore.rules`; assumed server-only via Admin SDK.

---

### `mockSummitAccessCodes` Collection

**Documents**: `mockSummitAccessCodes/{code}`

**Purpose**: Control limited-use access codes for Mock Global Summit.

**Fields (from `create-order` usage)**:

| Field        | Type                 | Required | Notes |
|--------------|----------------------|----------|-------|
| `active`     | `boolean`            | Yes      | Code must be active. |
| `expiresAt`  | `Timestamp \| Date`  | Yes      | Converted via `.toDate()`; must be in the future. |
| `usedCount`  | `number`             | Yes      | Incremented each time a code is used. |
| `maxUsage`   | `number`             | Yes      | Max allowed uses. |

**Usage**:

- `/api/payment/create-order`:
  - Fetches `mockSummitAccessCodes/{code}`.
  - Validates:
    - `active === true`.
    - `expiresAt` not in the past.
    - `usedCount < maxUsage`.
  - Increments `usedCount` via `FieldValue.increment(1)`.

**Security rules**:

- `match /mockSummitAccessCodes/{code}`:
  - `allow read, write: if false` – server-only via Admin SDK.

---

### `registrations` Collection

**Documents**: `registrations/{doc}`

**Purpose**: Legacy/auxiliary registrations; currently only read rules are defined.

**Fields**:

- Not explicitly typed; rules refer to `resource.data.uid`.

**Security rules**:

- `match /registrations/{doc}`:
  - `allow read` if `request.auth.uid == resource.data.uid`.
  - `allow create, update, delete: if false`.

No active API routes write or read `registrations`; it is reserved for server-only legacy logic.

---

### Firestore Rules Summary vs Backend Logic

Mapping of rules to collections (from `firestore.rules`):

| Collection              | Client Readable?                         | Client Writable?                                  | Server Writes?   |
|------------------------|-------------------------------------------|---------------------------------------------------|------------------|
| `appUsers`             | Yes (self only)                           | Yes (self only; cannot change `isOrganizer`)      | Yes (Admin)      |
| `registrations`        | Yes (self only)                           | No                                               | Yes (Admin only) |
| `passes`               | Yes (owner or organizer)                  | Update only by organizers                        | Yes (Admin)      |
| `teams`                | Yes (leader or organizer)                 | Update only by organizers                        | Yes (Admin)      |
| `payments`             | Yes (owner only)                          | No                                               | Yes (Admin)      |
| `mockSummitAccessCodes`| No                                        | No                                               | Yes (Admin)      |
| `events`, `users`, `mockSummitCountries` | Not directly governed (Admin-only via SDK) | No public rules defined                           | Yes (Admin)      |

Backend API routes align with these rules by:

- Using Admin SDK for all writes.
- Exposing limited reads through API routes that enforce additional auth and role checks (e.g., organizer-only).

---

### Index & Cost Considerations

From usage patterns:

- Queries likely requiring composite indexes:
  - `payments`:
    - Filter by `cashfreeOrderId` (single-field index; default).
  - `passes`:
    - Filter by `paymentId` (default).
    - Filter by `userId` (used in `/api/users/passes`).
  - `events`:
    - Filter by `isActive` and possibly `category`, `type`, `date` (depending on seeding and admin tools).
- Cost hotspots:
  - Webhook, verify, and admin fix routes:
    - On success, each pass creation uses:
      - One or two document reads (payment, user, optional team).
      - One new `passes` write.
      - Optional `teams` update.
    - These are one-time operations per successful order.
  - `/api/admin/reconcile-payments`:
    - Scans all `payments` and `passes`. Intended as a manual tool; usage should be rare.
  - Events cache:
    - Designed to reduce `events` read costs even under load.

---

### Embedded vs Referenced Data

The schema combines references and embeddings as follows:

- **Referenced**:
  - `passes.paymentId → payments`.
  - `passes.userId → users/appUsers`.
  - `teams.leaderId → users/appUsers`.
  - `payments.selectedEvents[] → events`.
  - `payments.countryId → mockSummitCountries`.

- **Embedded snapshots**:
  - `passes.teamSnapshot`:
    - Immutable snapshot of team composition and member names at payment time.
    - Ensures that pass PDFs and QR payloads reflect the state at purchase even if the `teams` doc is later updated.

This strikes a balance between normalization (for operational logic) and denormalization (for user-facing output and resilience).

