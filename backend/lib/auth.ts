import { GoogleAuthProvider, signInWithRedirect, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, getAuthSafe } from '@/lib/firebase';

const FIREBASE_NOT_CONFIGURED =
  'Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, and NEXT_PUBLIC_FIREBASE_PROJECT_ID to .env.local';

export async function signInWithGoogle() {
  const realAuth = getAuthSafe();
  if (!realAuth) {
    throw new Error(FIREBASE_NOT_CONFIGURED);
  }
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');

  // Use redirect instead of popup for better mobile experience
  await signInWithRedirect(realAuth, provider);
}

export async function signOut() {
  const realAuth = getAuthSafe();
  if (!realAuth) return;
  return await firebaseSignOut(realAuth);
}

