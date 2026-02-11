## 1. Overview

Authentication and authorization are handled by **Firebase Authentication** (client‑side) and **Firestore security rules + API checks** (server‑side).

This document explains:

- How users sign in and how auth state is managed
- How tokens are issued, verified, and refreshed
- How roles (user vs organizer) are modeled
- How route and data access control are enforced

---

## 2. Authentication

### 2.1 Provider & Identity

- **Provider:** Firebase Authentication (Google Sign‑In)
- **Identity:** Each user is identified by a Firebase **UID**.
- **Profile:** Additional profile details are stored in `users/{uid}` documents (see `DATABASE_SCHEMA.md`).

### 2.2 Client-Side Auth Flow

Client‑side authentication is managed by `AuthContext` (`src/features/auth/AuthContext.tsx`).

Key responsibilities:

- Initialize Firebase Auth using `getAuthSafe()` from `src/lib/firebase/clientApp.ts`.
- Handle redirect result from Google sign‑in (`getRedirectResult`).
- Subscribe to auth state via `onAuthStateChanged`.
- For authenticated users:
  - Load Firestore profile from `users/{uid}` into `userData`.
- Provide auth API to components:
  - `signIn()` – triggers Google sign‑in via `authService`.
  - `signOut()` – signs the user out.
  - `updateUserProfile(data)` – writes profile to Firestore.

Simplified behavior:

```tsx
useEffect(() => {
  const auth = getAuthSafe();
  if (!auth) { setLoading(false); return; }

  getRedirectResult(auth).catch(handleErrors);

  const unsub = onAuthStateChanged(auth, async (u) => {
    setUser(u);
    if (u) await fetchUserProfile(u);
    else setUserData(null);
    setLoading(false);
  });

  return () => unsub();
}, []);
```

### 2.3 Sign-In

- `signIn()` uses the Firebase client SDK and Google provider (via `authService.signInWithGoogle`).
- On completion:
  - User is redirected back to the site.
  - `AuthContext` picks up the new `user` and loads their profile.
- Errors:
  - Network issues and popup closure are handled with user‑friendly alerts.
  - If Firebase is not configured, a clear alert explains the missing env vars.

### 2.4 Sign-Out

- `signOut()` calls Firebase `signOut()` via `authService.authSignOut`.
- Clears auth state in `AuthContext` and reverts UI to unauthenticated state.

### 2.5 Token Lifecycle

- **ID Token Creation:**
  - Issued automatically by Firebase Auth after successful sign‑in.
  - Short‑lived (typically 1 hour) and auto‑refreshed by the Firebase SDK.

- **Usage from Frontend:**
  - For protected API calls, frontend obtains the current ID token and sends:

    ```http
    Authorization: Bearer <FIREBASE_ID_TOKEN>
    ```

- **Verification on Server:**
  - API routes call `getAdminAuth().verifyIdToken(idToken)` (from `src/lib/firebase/adminApp.ts`).
  - This step:
    - Confirms token validity and expiration.
    - Provides `uid`, email, and other claims.

- **Refresh:**
  - Client SDK handles token refresh silently.
  - Expired or invalid tokens will cause API routes to return `401`; the frontend can prompt re‑login if needed.

---

## 3. Roles & Permission Model

There are two main roles:

### 3.1 Regular User

- Created by default when someone signs in.
- Characteristics:
  - `users/{uid}.isOrganizer` is **absent** or `false`.
- Permissions:
  - Update their own profile (`users/{uid}`).
  - Initiate and verify payments for themselves.
  - Read their own payments (`payments`), passes (`passes`), and legacy registrations (`registrations`).
  - See and download their own passes.

### 3.2 Organizer

- A special role, typically set manually by admins via server‑side scripts or console.
- Characteristics:
  - `users/{uid}.isOrganizer === true`.
- Permissions:
  - All regular user permissions, plus:
  - Read **any** pass (`passes/{passId}`) and **any** team (`teams/{teamId}`).
  - Update passes to mark them as used (scan) via API.
  - Update team member attendance via scan‑member API.

### 3.3 Role Storage

- Role is stored as a boolean flag on the user profile:

```json
users/{uid} {
  "uid": "uid123",
  "name": "John Doe",
  "isOrganizer": true
}
```

- `isOrganizer` cannot be set or modified by clients due to Firestore rules:
  - On **create**, `isOrganizer` must be `false`.
  - On **update**, any change to `isOrganizer` is rejected.
- Role elevation is done via:
  - Firestore console, or
  - Backend/admin scripts (using Admin SDK).

---

## 4. Route & Data Access Control

Authorization is enforced at **three layers**:

1. **Frontend routing & UI guards**
2. **API route checks using Admin SDK**
3. **Firestore security rules**

### 4.1 Frontend Route Guards (High-Level)

Examples:

- `/register`:
  - Not signed in → redirected to `/login`.
  - Signed in but no profile → redirected to `/register/profile`.
  - Signed in with profile → continues to registration/pass flow.

- `/login`:
  - Already signed in → redirected to `/register`.

- `/register/my-pass`:
  - Not signed in → redirected to `/login`.

These guards improve UX but are **not** the sole security mechanism; backend checks always enforce real access control.

### 4.2 API-Level Authorization

Typical pattern in protected routes:

1. Extract Bearer token from headers.
2. Verify token via `getAdminAuth().verifyIdToken(idToken)`.
3. Fetch user record from `users/{uid}` if role information is needed.
4. Enforce ownership/role checks:
   - For example, in `/api/passes/[passId]`:
     - Ensure `pass.userId === uid` **or** `isOrganizer === true`.
   - In `/api/passes/scan`:
     - Ensure `isOrganizer === true`.

If any check fails:

- Return `401` for missing/invalid token.
- Return `403` for valid token but insufficient permissions.

### 4.3 Firestore Security Rules (Data Layer)

Security rules (see `firestore.rules`) act as the **last line of defense**:

- **Users**
  - Read/write **own** document.
  - Cannot modify `isOrganizer`.

- **Payments**
  - Read only own payments (`payments.userId == request.auth.uid`).
  - All writes disabled for clients; only Admin SDK (server) can modify.

- **Passes**
  - Read allowed if:
    - Owner of pass, or
    - Organizer.
  - Create/delete: denied to clients.
  - Update: allowed only for organizers (used for scanning).

- **Teams**
  - Read allowed if leader or organizer.
  - Create/delete: denied to clients.
  - Update: allowed only for organizers (attendance).

- **Registrations (legacy)**
  - Read: only owner.
  - Writes: denied to clients.

Even if an API route has a bug, security rules restrict what client‑side code can do directly with the Firestore SDK.

---

## 5. Authentication Flows

### 5.1 User Registration & Profile Flow

1. User navigates to `/register`.
2. If not signed in:
   - Redirected to `/login` where they click “Sign in with Google”.
3. After sign‑in completes:
   - `AuthContext` sets `user`.
   - App checks for existing `users/{uid}` document.
4. If profile is missing:
   - User is taken to `/register/profile`.
   - Submits profile form (`name`, `college`, `phone`).
   - `POST /api/users/profile` validates + sanitizes inputs and writes to Firestore.
5. Once profile exists:
   - User proceeds to `/register/pass` to choose pass type and continue with payment.

### 5.2 Login & Logout Flow

- **Login:**
  - Initiated via `signIn()` in `AuthContext`.
  - Uses Firebase’s redirect/popup flow.
  - On return, `getRedirectResult` handles success/failure and `onAuthStateChanged` sets the user.

- **Logout:**
  - Triggered from the UI (e.g. nav menu).
  - Calls `signOut()` which:
    - Signs out with Firebase.
    - Clears `user` and `userData` from context.

---

## 6. Security Practices & Protections

### 6.1 Input Validation & Sanitization

- All profile and key request bodies are validated using **Zod** schemas:
  - Enforce shape and constraints (phone format, name length, etc.).
- `sanitizeInput()` strips dangerous patterns (`<`, `>`, `javascript:`, inline event handlers).
- This prevents basic XSS and script injection in stored data.

### 6.2 Rate Limiting

- Implemented in `src/lib/security/rateLimiter.ts`:
  - Limits per IP address within a time window (in‑memory).
- Applied to:
  - `/api/payment/create-order`
  - `/api/users/profile` (POST)
  - `/api/passes/scan`
  - `/api/passes/scan-member`
- Limits brute‑force attempts and accidental rapid re‑submissions.

### 6.3 QR Token Security

- QR payloads are **signed** using HMAC‑SHA256 with `QR_SECRET_KEY`.
- Token format: `passId:expiry.signature`.
- Backend verifies:
  - Signature matches secret.
  - Expiry has not passed.
- Prevents:
  - Tampering with pass IDs in QR data.
  - Reuse of very old QR tokens (replay attacks).

Details are in `PASS_QR_SYSTEM.md`.

### 6.4 Webhook Verification

- The Cashfree webhook endpoint validates:
  - HMAC signature using the Cashfree secret.
  - Event types and payload integrity.
- Only valid, signed webhook calls can transition payments from `pending` to `success`.

### 6.5 Principle of Least Privilege

- Clients cannot:
  - Directly create or modify `payments`, `passes`, or `teams` documents.
  - Modify `isOrganizer`.
- Organizers can perform only specific actions related to scanning and attendance.
- Admin API (`/api/admin/fix-stuck-payment`) is intentionally left unauthenticated but must be protected at the **infrastructure level** (e.g. IP whitelisting, not exposed publicly).

---

## 7. Summary

- Authentication is handled by **Firebase Auth + AuthContext**, with ID tokens used for API calls.
- Authorization combines:
  - **Route guards** and role‑based UI,
  - **Server‑side checks** with Firebase Admin,
  - **Firestore security rules** for data access.
- The permission model is simple: **user vs organizer**, with strong guarantees that:
  - Users can only manage their own data and passes.
  - Organizers can scan passes and manage attendance, but not arbitrarily modify user profiles or payments.

For concrete endpoint details and error responses, see `BACKEND_API_REFERENCE.md`. For DB structure and rules, see `DATABASE_SCHEMA.md`.

