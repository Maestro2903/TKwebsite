'use client';

import { useAuth } from '@/features/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import { AwardBadge } from '@/components/decorative/AwardBadge';
import { useLenis } from '@/hooks/useLenis';

export default function LoginPage() {
  useLenis();
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await signIn();
    } catch {
      // auth/popup-closed-by-user or other errors - user stays on page
    } finally {
      setSigningIn(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      router.replace('/register');
    }
  }, [user, loading, router]);

  // Loading state
  if (loading) {
    return (
      <>
        <Navigation />
        <main className="page_main page_main--registration registration-loading">
          <div className="registration-loading__spinner">
            <div className="reg-spinner" />
          </div>
        </main>
      </>
    );
  }

  // Already signed in - redirect
  if (user) {
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

  // Login page - Premium Split-Screen Auth Layout
  return (
    <>
      <Navigation />
      <div className="auth-page">
        {/* Split Screen Layout */}
        <div className="auth-container">
          {/* Left Panel - Branding & Testimonial (Desktop only) */}
          <div className="auth-left-panel">
            <div
              className="auth-left-bg"
              style={{
                backgroundImage: "url(/assets/images/parallax.webp)",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            />
            <div className="auth-left-overlay" />

            {/* Logo */}
            <div className="auth-logo">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="auth-logo-icon"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
              <span className="auth-logo-text">Takshashila 2026</span>
            </div>

            {/* Testimonial */}
            <div className="auth-testimonial">
              <blockquote className="auth-quote">
                &ldquo;The most electrifying tech fest I&apos;ve ever attended. From the innovations to the proshows, every moment was unforgettable.&rdquo;
              </blockquote>
              <div className="auth-author">
                <span className="auth-author-name">— Past Attendee</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Auth Form */}
          <div className="auth-right-panel">
            {/* Mobile: background image (hidden on desktop) */}
            <div
              className="auth-right-bg"
              style={{
                backgroundImage: "url(/assets/images/parallax.webp)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              aria-hidden
            />
            <div className="auth-right-overlay" aria-hidden />
            {/* Mobile Logo (visible only on mobile) */}
            <div className="auth-mobile-logo">
              <span className="auth-logo-text">Takshashila 2026</span>
            </div>

            <div className="auth-form-container">
              {/* Header */}
              <div className="auth-header">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">
                  Sign in to your CIT Takshashila 2026 account
                </p>
              </div>

              {/* Auth Form */}
              <div className="auth-form">
                <div className="auth-form-fields items-center">
                  {signingIn ? (
                    <div className="flex justify-center items-center h-[54px]">
                      <div className="reg-spinner w-5 h-5 border-2 border-white/30 border-t-white" />
                    </div>
                  ) : (
                    <div className="w-full max-w-[260px]">
                      <AwardBadge type="button" onClick={handleGoogleSignIn} disabled={signingIn}>
                        SIGN IN WITH GOOGLE
                      </AwardBadge>
                    </div>
                  )}
                </div>
              </div>

              {/* Register Link */}
              <div className="auth-footer">
                <p className="auth-footer-text">
                  Don&apos;t have an account?{' '}
                  <a href="/register" className="auth-footer-link">
                    Register here
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
