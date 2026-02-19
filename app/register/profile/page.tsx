"use client";

import { useAuth } from '@/features/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Footer from '@/components/layout/Footer';
import Navigation from '@/components/layout/Navigation';
import { AwardBadge } from '@/components/decorative/AwardBadge';

export default function ProfilePage() {
  const { user, userData, loading: authLoading, updateUserProfile } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Redirect logic
  useEffect(() => {
    if (authLoading) return;

        // Not signed in - go to sign in page
        if (!user) {
            router.push('/register');
            return;
        }

        // Already has profile - go to pass selection
        if (userData) {
            router.push('/register/pass');
        }
    }, [user, userData, authLoading, router]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateUserProfile(formData);

            router.push('/register/pass');
        } catch (error) {
            console.error('Profile update error:', error);
        }
        setIsLoading(false);
    };

    // Loading state
    if (authLoading) {
        return (
            <>
                <main className="page_main page_main--registration registration-loading">
                    <div className="registration-loading__spinner">
                        <div className="reg-spinner" />
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Not signed in - show redirect message
    if (!user) {
        return (
            <>
                <main className="page_main page_main--registration registration-loading">
                    <div className="registration-loading__spinner">
                        <div className="reg-spinner" />
                        <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Redirecting to sign in...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Already has profile - go to pass selection
    if (userData) {
        return (
            <>
                <main className="page_main page_main--registration registration-loading">
                    <div className="registration-loading__spinner">
                        <div className="reg-spinner" />
                        <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Redirecting...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

  // Profile setup form
  return (
    <>
      <Navigation />
      <main
        id="main"
        className="min-h-screen bg-black text-white py-20 px-4"
      >
        {/* Hero */}
        <section className="max-w-2xl mx-auto text-center mb-16">
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 border border-blue-500/30 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden />
              <div className="text-[0.5rem] font-bold tracking-[0.2em] uppercase text-blue-400/70" style={{ fontFamily: '"Akira", sans-serif' }}>
                PROFILE SETUP
              </div>
            </div>
          </div>
          <h1 
            className="text-5xl md:text-6xl font-extrabold mb-6 tracking-[0.04em] uppercase"
            style={{ 
              fontFamily: '"Akira", sans-serif',
              background: 'linear-gradient(180deg, #e0e8f0 0%, #8ab4d6 30%, #ffffff 50%, #6a9ec0 70%, #c0d8e8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))'
            }}
          >
            Complete Your Profile
          </h1>
          <p className="text-sm tracking-[0.12em] uppercase" style={{ fontFamily: '"Trebuchet MS", sans-serif', color: 'rgba(120, 170, 210, 0.6)' }}>
            We need a few details to get you started
          </p>
        </section>

        {/* Profile Form */}
        <div className="max-w-xl mx-auto relative">
          {/* Y2K star sparkles */}
          <span 
            className="absolute text-blue-400/40 text-2xl pointer-events-none animate-pulse"
            style={{ top: '-2rem', left: '10%' }}
            aria-hidden
          >
            ✦
          </span>
          <span 
            className="absolute text-blue-300/30 text-3xl pointer-events-none animate-pulse"
            style={{ top: '50%', right: '-2rem', animationDelay: '0.5s' }}
            aria-hidden
          >
            ✦
          </span>
          <span 
            className="absolute text-blue-500/30 text-xl pointer-events-none animate-pulse"
            style={{ bottom: '10%', left: '-1.5rem', animationDelay: '1s' }}
            aria-hidden
          >
            ✧
          </span>
          
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="mb-6">
              <label 
                className="block text-[0.55rem] font-bold uppercase tracking-[0.15em] text-blue-400/70 mb-2"
                style={{ fontFamily: '"Akira", sans-serif' }}
              >
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-6 py-3.5 text-[0.9375rem] border-2 border-blue-500/20 bg-black/40 text-white tracking-wide transition-all duration-300 focus:outline-none focus:border-blue-500/50 focus:bg-black/55 focus:shadow-[0_0_0_3px_rgba(30,109,171,0.12),0_0_12px_rgba(30,109,171,0.1)] placeholder:text-white/25"
                style={{ fontFamily: '"Trebuchet MS", sans-serif' }}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="mb-6">
              <label 
                className="block text-[0.55rem] font-bold uppercase tracking-[0.15em] text-blue-400/70 mb-2"
                style={{ fontFamily: '"Akira", sans-serif' }}
              >
                College Name
              </label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) =>
                  setFormData({ ...formData, college: e.target.value })
                }
                className="w-full px-6 py-3.5 text-[0.9375rem] border-2 border-blue-500/20 bg-black/40 text-white tracking-wide transition-all duration-300 focus:outline-none focus:border-blue-500/50 focus:bg-black/55 focus:shadow-[0_0_0_3px_rgba(30,109,171,0.12),0_0_12px_rgba(30,109,171,0.1)] placeholder:text-white/25"
                style={{ fontFamily: '"Trebuchet MS", sans-serif' }}
                placeholder="Enter your college name"
                required
              />
            </div>
            
            <div className="mb-6">
              <label 
                className="block text-[0.55rem] font-bold uppercase tracking-[0.15em] text-blue-400/70 mb-2"
                style={{ fontFamily: '"Akira", sans-serif' }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-6 py-3.5 text-[0.9375rem] border-2 border-blue-500/20 bg-black/40 text-white tracking-wide transition-all duration-300 focus:outline-none focus:border-blue-500/50 focus:bg-black/55 focus:shadow-[0_0_0_3px_rgba(30,109,171,0.12),0_0_12px_rgba(30,109,171,0.1)] placeholder:text-white/25"
                style={{ fontFamily: '"Trebuchet MS", sans-serif' }}
                placeholder="Enter your phone number"
                required
              />
            </div>
            
            <div className="flex justify-center pt-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-[54px]">
                  <div className="reg-spinner w-5 h-5 border-2 border-white/30 border-t-white" />
                </div>
              ) : (
                <button
                  type="submit"
                  className="login-cta-btn"
                  disabled={isLoading}
                >
                  <span className="login-cta-btn__bg" />
                  <span
                    className="login-cta-btn__glitch"
                    data-text="CONTINUE"
                  />
                  <span className="login-cta-btn__text">CONTINUE</span>
                  <span className="login-cta-btn__border" />
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
