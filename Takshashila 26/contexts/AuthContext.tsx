'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signInWithGoogle, signOut as authSignOut } from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<unknown>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    try {
      return await signInWithGoogle();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Sign-in failed. Check the console for details.';
      if (typeof window !== 'undefined' && msg.includes('Firebase is not configured')) {
        alert(
          'Google sign-in is not configured. Add NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, and NEXT_PUBLIC_FIREBASE_PROJECT_ID to .env.local (see .env.example).'
        );
      } else {
        throw err;
      }
    }
  }, []);
  const signOut = useCallback(() => authSignOut(), []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signIn, signOut }),
    [user, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
