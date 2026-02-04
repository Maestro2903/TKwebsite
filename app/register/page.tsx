'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PASS_TYPES } from '@/lib/types';
import { collection, addDoc } from 'firebase/firestore';
import { auth, getDb } from '@/lib/firebase';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { AwardBadge } from '@/components/AwardBadge';
import { useLenis } from '@/hooks/useLenis';

// Icons matching the pass types - larger for visual headers
const passIcons: Record<string, React.ReactNode> = {
  day_pass: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
  group_events: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  proshow: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
    </svg>
  ),
  sana_concert: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
};

const passDescriptions: Record<string, string> = {
  day_pass: 'Access to all technical and non-technical events for one day.',
  group_events: 'Perfect for team competitions. Register your entire team.',
  proshow: 'Access to Day 1 and Day 3 proshows with premium seating.',
  sana_concert: 'All-access pass including SANA concert and all 3-day events.',
};

// Pass Card Component - Event Card Style
interface PassCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  priceLabel?: string;
  icon: React.ReactNode;
  isSelected: boolean;
  isMostPopular?: boolean;
}

function PassCard({ id, name, description, price, priceLabel, icon, isSelected, isMostPopular }: PassCardProps) {
  return (
    <span className={`pass-card-v2 ${isSelected ? 'pass-card-v2--selected' : ''}`}>
      {/* Selection Indicator */}
      <span className="pass-card-v2__selector" aria-hidden>
        <span className="pass-card-v2__selector-dot" />
      </span>

      {/* Visual Header - Like Event Card Image */}
      <span className="pass-card-v2__visual">
        <span className="pass-card-v2__visual-icon">
          {icon}
        </span>
        {isMostPopular && (
          <span className="pass-card-v2__badge">Most Popular</span>
        )}
      </span>

      {/* Content - Like Event Card Content */}
      <span className="pass-card-v2__content">
        <span className="pass-card-v2__title">{name}</span>
        <span className="pass-card-v2__description">{description}</span>
        <span className="pass-card-v2__price">
          <span className="pass-card-v2__price-currency" aria-hidden>₹</span>
          <span className="pass-card-v2__price-amount">{price}</span>
          {priceLabel && (
            <span className="pass-card-v2__price-label">{priceLabel}</span>
          )}
        </span>
      </span>
    </span>
  );
}

export default function RegisterPage() {
  useLenis();
  const { user, userData, loading: authLoading, updateUserProfile, signIn } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'profile' | 'pass'>('profile');
  const [formData, setFormData] = useState({ name: '', college: '', phone: '' });
  const [selectedPass, setSelectedPass] = useState<string>('');
  const [teamData, setTeamData] = useState({
    teamName: '',
    members: [{ name: '', phone: '' }],
  });
  const [isLoading, setIsLoading] = useState(false);
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
    if (authLoading) return;
    if (!user) return;
    if (userData) setStep('pass');
  }, [user, userData, authLoading]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) document.body.removeChild(script);
    };
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateUserProfile(formData);
      setStep('pass');
    } catch (error) {
      console.error('Profile update error:', error);
    }
    setIsLoading(false);
  };

  const calculateAmount = () => {
    if (selectedPass === 'group_events') {
      return teamData.members.length * (PASS_TYPES.GROUP_EVENTS.pricePerPerson ?? 250);
    }
    const passConfig = Object.values(PASS_TYPES).find((p) => p.id === selectedPass);
    return (passConfig as { price?: number })?.price ?? 0;
  };

  const handlePayment = async () => {
    if (!selectedPass || !user || !userData) return;
    setIsLoading(true);

    try {
      const amount = calculateAmount();
      let teamId: string | null = null;

      if (selectedPass === 'group_events') {
        const teamRef = await addDoc(collection(getDb(), 'teams'), {
          teamName: teamData.teamName,
          leaderId: user.uid,
          members: teamData.members,
          passId: '',
          totalAmount: amount,
        });
        teamId = teamRef.id;
      }

      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        alert('Session expired. Please sign in again.');
        setIsLoading(false);
        return;
      }

      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.uid,
          amount,
          passType: selectedPass,
          teamData: {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
          },
          teamId,
          teamMemberCount: selectedPass === 'group_events' ? teamData.members.length : undefined,
        }),
      });

      const result = await orderResponse.json();

      if (!result.orderId || !result.sessionId) {
        alert('Error: ' + (result.error || 'Failed to create order'));
        setIsLoading(false);
        return;
      }

      const { orderId, sessionId } = result;

      await addDoc(collection(getDb(), 'payments'), {
        userId: user.uid,
        amount,
        status: 'pending',
        cashfreeOrderId: orderId,
        passType: selectedPass,
        teamId: teamId ?? null,
        createdAt: new Date(),
      });

      const cashfree = window.Cashfree?.({
        mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox',
      });
      if (!cashfree) {
        alert('Payment gateway failed to load. Please refresh and try again.');
        setIsLoading(false);
        return;
      }

      cashfree.checkout({
        paymentSessionId: sessionId,
        returnUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/payment/callback?order_id=${orderId}`,
        redirectTarget: '_modal',
        onPaymentFailure: () => setIsLoading(false),
        onPaymentSuccess: () => {
          window.location.href = `/payment/callback?order_id=${orderId}`;
        },
        onClose: () => setIsLoading(false),
      });
    } catch (error) {
      alert('Payment error: ' + (error instanceof Error ? error.message : 'Something went wrong'));
      setIsLoading(false);
    }
  };

  const removeMember = (idx: number) => {
    if (teamData.members.length > 1) {
      const newMembers = teamData.members.filter((_, i) => i !== idx);
      setTeamData({ ...teamData, members: newMembers });
    }
  };

  const selectedPassConfig = Object.values(PASS_TYPES).find((p) => p.id === selectedPass);

  // Loading state
  if (authLoading) {
    return (
      <>
        <Navigation />
        <main className="page_main page_main--registration registration-loading">
          <div className="registration-loading__spinner">
            <div className="reg-spinner" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Sign in required state - Premium Split-Screen Auth Layout
  if (!user) {
    return (
      <>
        <Navigation />
        <div className="auth-page">
          {/* Split Screen Layout */}
          <div className="auth-container">
            {/* Left Panel - Branding & Testimonial */}
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

              <div className="auth-form-container">
                {/* Header */}
                <div className="auth-header">
                  <h1 className="auth-title">Get Your Pass</h1>
                  <p className="auth-subtitle">
                    Sign in to register for CIT Takshashila 2026
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
                          CONTINUE WITH GOOGLE
                        </AwardBadge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Profile setup step
  if (step === 'profile') {
    return (
      <>
        <Navigation />
        <main id="main" className="page_main page_main--registration">
          {/* Hero */}
          <section className="registration-hero-v2">
            <div className="registration-hero-v2__eyebrow">
              <div className="eyebrow_wrap">
                <div className="eyebrow_layout">
                  <div className="eyebrow_marker" aria-hidden />
                  <div className="eyebrow_text u-text-style-main">PROFILE SETUP</div>
                </div>
              </div>
            </div>
            <h1 className="registration-hero-v2__title">Complete Your Profile</h1>
            <p className="registration-hero-v2__subtext">We need a few details to get you started</p>
          </section>

          {/* Profile Form */}
          <div className="u-container registration-profile-v2">
            <form onSubmit={handleProfileSubmit} className="registration-profile-v2__form">
              <div className="registration-profile-v2__field">
                <label className="registration-profile-v2__label">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="registration-profile-v2__input"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="registration-profile-v2__field">
                <label className="registration-profile-v2__label">College Name</label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="registration-profile-v2__input"
                  placeholder="Enter your college name"
                  required
                />
              </div>
              <div className="registration-profile-v2__field">
                <label className="registration-profile-v2__label">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="registration-profile-v2__input"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div className="registration-profile-v2__cta">
                {isLoading ? (
                  <div className="flex justify-center items-center h-[54px]">
                    <div className="reg-spinner w-5 h-5 border-2 border-white/30 border-t-white" />
                  </div>
                ) : (
                  <div className="w-full max-w-[260px]">
                    <AwardBadge type="submit" disabled={isLoading}>CONTINUE</AwardBadge>
                  </div>
                )}
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Pass selection step - Event Card Style
  return (
    <div data-page="register">
      <Navigation />
      <main id="main" className="page_main page_main--registration">
        {/* Hero */}
        <section className="registration-hero-v2">
          <div className="registration-hero-v2__eyebrow">
            <div className="eyebrow_wrap">
              <div className="eyebrow_layout">
                <div className="eyebrow_marker" aria-hidden />
                <div className="eyebrow_text u-text-style-main">REGISTRATION</div>
              </div>
            </div>
          </div>
          <h1 className="registration-hero-v2__title">Choose Your Pass</h1>
          <p className="registration-hero-v2__subtext">Select a pass to attend Takshashila 2026</p>
        </section>

        {/* Pass Selection Layout */}
        <div className="u-container registration-layout-v2">
          {/* Pass Cards Grid */}
          <div className="registration-passes-v2">
            <div className="registration-passes-v2__grid">
              {Object.entries(PASS_TYPES).map(([key, pass]) => (
                <label
                  key={key}
                  className="pass-card-v2-option"
                  {...(pass.id === 'sana_concert' ? { 'data-most-popular': '' } : {})}
                >
                  {pass.id === 'sana_concert' && (
                    <span className="sr-only">Recommended</span>
                  )}
                  <input
                    type="radio"
                    name="passType"
                    value={pass.id}
                    checked={selectedPass === pass.id}
                    onChange={() => setSelectedPass(pass.id)}
                    className="pass-card-v2-input"
                  />
                  <PassCard
                    id={pass.id}
                    name={pass.name}
                    description={passDescriptions[pass.id] || 'Access to events and activities.'}
                    price={pass.id === 'group_events' ? (PASS_TYPES.GROUP_EVENTS.pricePerPerson ?? 250) : ((pass as { price?: number }).price ?? 0)}
                    priceLabel={pass.id === 'group_events' ? 'per person' : undefined}
                    icon={passIcons[pass.id] ?? passIcons.day_pass}
                    isSelected={selectedPass === pass.id}
                    isMostPopular={pass.id === 'sana_concert'}
                  />
                </label>
              ))}
            </div>

            {/* Team Section - Show when group pass is selected */}
            {selectedPass === 'group_events' && (
              <div className="registration-team-v2">
                <h3 className="registration-team-v2__title">Team Details</h3>
                <div className="registration-team-v2__field">
                  <label className="registration-team-v2__label">Team Name</label>
                  <input
                    type="text"
                    value={teamData.teamName}
                    onChange={(e) => setTeamData({ ...teamData, teamName: e.target.value })}
                    className="registration-team-v2__input"
                    placeholder="Enter your team name"
                    required
                  />
                </div>
                <div className="registration-team-v2__members">
                  {teamData.members.map((member, idx) => (
                    <div key={idx} className="registration-team-v2__member">
                      <div className="registration-team-v2__member-header">
                        <h4 className="registration-team-v2__member-title">
                          Member {idx + 1}
                          {idx === 0 && <span className="registration-team-v2__member-badge">You (Leader)</span>}
                        </h4>
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => removeMember(idx)}
                            className="registration-team-v2__member-remove"
                            aria-label="Remove member"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="registration-team-v2__member-fields">
                        <input
                          type="text"
                          placeholder="Member name"
                          value={member.name}
                          onChange={(e) => {
                            const newMembers = [...teamData.members];
                            newMembers[idx]!.name = e.target.value;
                            setTeamData({ ...teamData, members: newMembers });
                          }}
                          className="registration-team-v2__input"
                          required
                        />
                        <input
                          type="tel"
                          placeholder="Phone number"
                          value={member.phone}
                          onChange={(e) => {
                            const newMembers = [...teamData.members];
                            newMembers[idx]!.phone = e.target.value;
                            setTeamData({ ...teamData, members: newMembers });
                          }}
                          className="registration-team-v2__input"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {teamData.members.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setTeamData({ ...teamData, members: [...teamData.members, { name: '', phone: '' }] })}
                    className="registration-team-v2__add"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Team Member ({teamData.members.length}/6)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Checkout Panel */}
          <aside className="registration-checkout-v2">
            <h2 className="registration-checkout-v2__title">Order Summary</h2>

            {!selectedPass ? (
              <div className="registration-checkout-v2__empty">
                <div className="registration-checkout-v2__empty-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <p className="registration-checkout-v2__empty-text">Select a pass to begin</p>
              </div>
            ) : (
              <>
                <div className="registration-checkout-v2__selected">
                  <h3 className="registration-checkout-v2__pass-name">{selectedPassConfig?.name}</h3>
                  {selectedPass === 'group_events' && (
                    <p className="registration-checkout-v2__pass-details">{teamData.members.length} members × ₹250</p>
                  )}
                </div>

                <div className="registration-checkout-v2__total">
                  <span className="registration-checkout-v2__total-label">Total</span>
                  <span className="registration-checkout-v2__total-amount">₹{calculateAmount()}</span>
                </div>

                <div className="registration-checkout-v2__cta">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-[54px]">
                      <div className="reg-spinner w-5 h-5 border-2 border-white/30 border-t-white" />
                    </div>
                  ) : (
                    <div className="registration-checkout-v2__cta-btn-wrap">
                      <AwardBadge type="button" onClick={handlePayment} variant="gold-solid">
                        PROCEED TO SECURE PAYMENT
                      </AwardBadge>
                    </div>
                  )}
                </div>

                <p className="registration-checkout-v2__security">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secured by Cashfree
                </p>
              </>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
