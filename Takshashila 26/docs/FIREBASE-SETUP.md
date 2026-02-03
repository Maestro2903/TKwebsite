# Firebase setup (CIT Takshashila)

## 1. Config files (already in repo)

- **`firebase.json`** — Firestore rules and indexes paths.
- **`firestore.rules`** — Security rules for `users` and `registrations`.
- **`firestore.indexes.json`** — Firestore indexes (empty by default).

## 2. One-time: login and link project

Run these in your terminal from the project root (`zeitmedia-clone/`).

### Step 1: Log in to Firebase

```bash
firebase login
```

Complete the browser sign-in (Google account).

### Step 2: Create or select a Firebase project

**Option A — Create a new project**

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** → choose a name (e.g. `cit-takshashila`) → follow the steps.
3. Enable **Authentication** → Sign-in method → enable **Google**.
4. Enable **Firestore Database** → Create database (start in test mode if you prefer; we deploy rules next).

**Option B — Use an existing project**

Use the project ID from the Firebase Console.

### Step 3: Link this app to the project

```bash
firebase use --add
```

Select the project from the list (or paste project ID). Choose an alias (e.g. `default`). This creates/updates `.firebaserc`.

### Step 4: Deploy Firestore rules (and indexes)

```bash
firebase deploy --only firestore
```

This deploys `firestore.rules` and `firestore.indexes.json` to your linked project.

## 3. App configuration (.env)

Copy `.env.example` to `.env` and set:

**Client (NEXT_PUBLIC_*):**

- `NEXT_PUBLIC_FIREBASE_API_KEY` — from Project settings → General → Your apps → Web app → config.
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — e.g. `your-project.firebaseapp.com`.
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — your project ID.

**Server (API routes / webhooks):**

- `FIREBASE_SERVICE_ACCOUNT_KEY` — from Project settings → Service accounts → Generate new private key; paste the **entire JSON as a single line** (or use a file and load it in `lib/firebase-admin.ts` if you change the code to support that).

## 4. Useful commands

| Command | Purpose |
|--------|--------|
| `firebase login` | Log in (opens browser). |
| `firebase use` | Show current project. |
| `firebase use --add` | Link another project/alias. |
| `firebase deploy --only firestore` | Deploy rules + indexes. |
| `firebase firestore:rules` | Open rules in browser (optional). |

After this, the app can use Firebase Auth and Firestore; the create-order API and Cashfree webhook use the server SDK via `FIREBASE_SERVICE_ACCOUNT_KEY`.
