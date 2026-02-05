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
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, getAuthSafe } from '@/lib/firebase';
import { signInWithGoogle, signOut as authSignOut } from '@/lib/auth';
import type { UserProfile, UserProfileUpdate } from '@/lib/firestore-types';

interface AuthContextValue {
  user: User | null;
  userData: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<unknown>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: UserProfileUpdate) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchUserProfile = useCallback(async (u: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', u.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserProfile);
      } else {
        setUserData(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUserData(null);
    }
  }, []);

  useEffect(() => {
    const authInstance = getAuthSafe();
    if (!authInstance) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;
    const unsubRef: { current: (() => void) | null } = { current: null };

    const init = async () => {
      // Check if we are returning from a redirect flow
      if (typeof window !== 'undefined' && sessionStorage.getItem('auth_pending')) {
        setLoading(true);
      }

      try {
        const result = await getRedirectResult(authInstance);
        if (result) {
          console.log('Sign-in successful');
        }
      } catch (error: any) {
        console.error('Redirect result error:', error);
        if (error.code === 'auth/network-request-failed') {
          alert('Network error. Please check your connection and try again.');
        } else if (error.code !== 'auth/popup-closed-by-user') {
          alert('Sign-in failed. Please try again.');
        }
      } finally {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('auth_pending');
        }
      }

      if (!isSubscribed) return;

      unsubRef.current = onAuthStateChanged(authInstance, async (u) => {
        if (!isSubscribed) return;
        setUser(u);
        if (u) {
          await fetchUserProfile(u);
        } else {
          setUserData(null);
        }
        setLoading(false);
      });
    };

    init();

    return () => {
      isSubscribed = false;
      if (unsubRef.current) unsubRef.current();
    };
  }, [fetchUserProfile]);

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

  const updateUserProfile = useCallback(async (data: UserProfileUpdate) => {
    if (!user) throw new Error('No user logged in');
    const userRef = doc(db, 'users', user.uid);
    const email = user.email || user.providerData?.[0]?.email || '';
    const profile = {
      uid: user.uid,
      name: data.name,
      email: email,
      college: data.college,
      phone: data.phone,
      createdAt: serverTimestamp(),
    };
    await setDoc(userRef, profile);
    setUserData({ ...profile, createdAt: { toDate: () => new Date() } } as UserProfile);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, userData, loading, signIn, signOut, updateUserProfile }),
    [user, userData, loading, signIn, signOut, updateUserProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
