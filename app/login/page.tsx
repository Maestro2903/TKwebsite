"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "@/components/layout/Navigation";

export default function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await signIn();
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      // Only show alert for errors other than user closing the popup
      if (
        err.code !== "auth/popup-closed-by-user" &&
        err.code !== "auth/cancelled-by-user"
      ) {
        alert(`Sign-in failed: ${err.message || "Unknown error"}`);
      }
    } finally {
      setSigningIn(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      router.replace("/register");
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
            <p
              style={{
                marginTop: "1rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Redirecting...
            </p>
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
                backgroundPosition: "center",
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
                &ldquo;The most electrifying tech fest I&apos;ve ever attended.
                From the innovations to the proshows, every moment was
                unforgettable.&rdquo;
              </blockquote>
              <div className="auth-author">
                <span className="auth-author-name">— Past Attendee</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Auth Form */}
          <div className="auth-right-panel">
            {/* Y2K scanline overlay */}
            <div className="auth-y2k-scanlines" aria-hidden />
            {/* Y2K star sparkles */}
            <span className="auth-y2k-star auth-y2k-star--1" aria-hidden>
              ✦
            </span>
            <span className="auth-y2k-star auth-y2k-star--2" aria-hidden>
              ✦
            </span>
            <span className="auth-y2k-star auth-y2k-star--3" aria-hidden>
              ✧
            </span>
            <span className="auth-y2k-star auth-y2k-star--4" aria-hidden>
              ✦
            </span>
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
                  <button
                    className="login-cta-btn"
                    onClick={handleGoogleSignIn}
                    disabled={signingIn}
                  >
                    <span className="login-cta-btn__bg" />
                    <span
                      className="login-cta-btn__glitch"
                      data-text={
                        signingIn ? "SIGNING IN..." : "SIGN IN WITH GOOGLE"
                      }
                    />
                    <span className="login-cta-btn__text">
                      {signingIn ? (
                        <span className="login-cta-btn__loading">
                          <span className="login-cta-btn__spinner" />
                          SIGNING IN...
                        </span>
                      ) : (
                        "SIGN IN WITH GOOGLE"
                      )}
                    </span>
                    <span className="login-cta-btn__border" />
                  </button>
                </div>
              </div>

              {/* Register Link */}
              <hr className="auth-y2k-divider" />
              <div className="auth-footer">
                <p className="auth-footer-text">
                  Don&apos;t have an account?{" "}
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
