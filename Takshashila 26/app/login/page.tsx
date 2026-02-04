'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/register');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="page_main min-h-[60vh] flex items-center justify-center u-container py-16">
          <p className="text-white/70">Loading…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (user) {
    return null;
  }

  return (
    <>
      <Navigation />
      <main className="page_main min-h-[60vh] flex flex-col items-center justify-center u-container py-16">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold text-white md:text-3xl mb-2">
            Sign in to register
          </h1>
          <p className="text-white/70 mb-8">
            Use your Google account to register for CIT Takshashila 2026 passes.
          </p>
          <button
            type="button"
            onClick={() => signIn()}
            className="rounded bg-white px-8 py-3 font-semibold text-black hover:opacity-90 transition"
          >
            Sign in with Google
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
