import { type FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (_app) return _app;
  if (typeof window === 'undefined') return null;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !authDomain || !projectId) return null;
  const existing = getApps()[0];
  if (existing) {
    _app = existing as FirebaseApp;
    return _app;
  }
  _app = initializeApp({ apiKey, authDomain, projectId });
  return _app;
}

function getAuthInstance(): Auth {
  if (_auth) return _auth;
  const app = getFirebaseApp();
  if (!app) throw new Error('Firebase not configured or not in browser. Set NEXT_PUBLIC_FIREBASE_* in .env.local');
  _auth = getAuth(app);
  return _auth;
}

function getDbInstance(): Firestore {
  if (_db) return _db;
  const app = getFirebaseApp();
  if (!app) throw new Error('Firebase not configured or not in browser. Set NEXT_PUBLIC_FIREBASE_* in .env.local');
  _db = getFirestore(app);
  return _db;
}

export function getAuthSafe(): Auth | null {
  try {
    return getFirebaseApp() ? getAuthInstance() : null;
  } catch {
    return null;
  }
}

export const auth = new Proxy({} as Auth, {
  get(_, prop) {
    const a = getAuthSafe();
    if (!a) {
      if (prop === 'onAuthStateChanged') {
        return (cb: (u: unknown) => void) => {
          cb(null);
          return () => {};
        };
      }
      if (prop === 'currentUser') return null;
      return undefined;
    }
    return (a as unknown as Record<string, unknown>)[prop as string];
  },
});
export function getDb(): Firestore {
  return getDbInstance();
}

export const db = new Proxy({} as Firestore, {
  get(target, prop) {
    const instance = getDbInstance();
    const value = (instance as unknown as Record<string, unknown>)[prop as string];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
