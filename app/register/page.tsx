'use client';

import { useAuth } from '@/features/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navigation from '@/components/layout/Navigation';

export default function RegisterPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect logic
  useEffect(() => {
    if (authLoading) return;

    // Not signed in - redirect to login page
    if (!user) {
      router.push('/login');
      return;
    }

    // Signed in - redirect based on profile status
    if (userData) {
      router.push('/register/pass');
    } else {
      router.push('/register/profile');
    }
  }, [user, userData, authLoading, router]);

  // Show loading while redirecting
  return (
    <>
      <Navigation />
      <main className="page_main page_main--registration registration-loading">
        <div className="registration-loading__spinner">
          <div className="reg-spinner" />
          <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Redirecting...</p>
        </div>
      </main>
    </>
  );
}
