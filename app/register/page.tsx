'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PASS_TYPES } from '@/lib/types';
import { collection, addDoc } from 'firebase/firestore';
import { auth, getDb } from '@/lib/firebase';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import RegistrationPassCard from '@/components/RegistrationPassCard';
import { AwardBadge } from '@/components/AwardBadge';
import { useLenis } from '@/hooks/useLenis';

const passIcons: Record<string, React.ReactNode> = {
  day_pass: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  group_events: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  proshow: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  sana_concert: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
};

const passDescriptions: Record<string, string> = {
  day_pass: 'Access to all technical and non-technical events for one day.',
  group_events: 'Perfect for team competitions. Register your entire team.',
  proshow: 'Access to Day 1 and Day 3 proshows with premium seating.',
  sana_concert: 'All-access pass including SANA concert and all 3-day events.',
};

export default function RegisterPage() {
  useLenis();
  const { user, userData, loading: authLoading, updateUserProfile, signOut, signIn } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'profile' | 'pass'>('profile');
  const [formData, setFormData] = useState({ name: '', college: '', phone: '' });
  const [selectedPass, setSelectedPass] = useState<string>('');
  const [teamData, setTeamData] = useState({
    teamName: '',
    members: [{ name: '', phone: '' }],
  });
  const [isLoading, setIsLoading] = useState(false);

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

  if (!user) {
    return (
      <>
        <Navigation />
        <main className="page_main page_main--registration min-h-[60vh] flex flex-col items-center justify-center u-container py-16 px-5 pb-24 sm:pb-28 md:pb-32">
          <div className="eyebrow_wrap u-margin-bottom-4">
            <div className="eyebrow_layout">
              <div className="eyebrow_marker" aria-hidden />
              <div className="eyebrow_text u-text-style-main">
                SIGN IN REQUIRED
              </div>
            </div>
          </div>
          <p className="text-white/80 mb-6 font-medium text-center">Sign in to register for passes.</p>
          <div className="w-full max-w-[260px]">
            <AwardBadge onClick={() => signIn()}>SIGN IN WITH GOOGLE</AwardBadge>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (step === 'profile') {
    return (
      <>
        <Navigation />
        <main id="main" className="page_main page_main--registration">
          <section className="registration-profile-hero u-section" aria-labelledby="profile-hero-title">
            <div className="eyebrow_wrap u-margin-bottom-4">
              <div className="eyebrow_layout">
                <div className="eyebrow_marker" aria-hidden />
                <div className="eyebrow_text u-text-style-main">
                  PROFILE SETUP
                </div>
              </div>
            </div>
            <h1 id="profile-hero-title" className="registration-profile-hero__title">
              COMPLETE YOUR PROFILE
            </h1>
            <p className="registration-profile-hero__subtext">
              We need a few details to get you started
            </p>
          </section>

          <div className="u-container">
            <div className="registration-profile-form">
              <form onSubmit={handleProfileSubmit} className="registration-profile-form__form">
                <div className="registration-profile-form__field">
                  <label className="registration-profile-form__label">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="registration-profile-form__input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="registration-profile-form__field">
                  <label className="registration-profile-form__label">College Name</label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="registration-profile-form__input"
                    placeholder="Enter your college name"
                    required
                  />
                </div>
                <div className="registration-profile-form__field">
                  <label className="registration-profile-form__label">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="registration-profile-form__input"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div className="registration-profile-form__cta">
                  {isLoading ? (
                    <div className="registration-profile-form__submit">
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
          </div>

          <div
            data-wf--spacer--section-space="main"
            className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
          />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main id="main" className="page_main page_main--registration">
        <div className="u-container registration-selector-layout">
          <div className="registration-selector-layout__left">
            <fieldset className="registration-pass-options">
              <legend className="registration-pass-options__legend">Choose your pass</legend>
              <div className="registration-pass-options__list">
                {Object.entries(PASS_TYPES).map(([key, pass]) => (
                  <label key={key} className="registration-pass-option">
                    <input
                      type="radio"
                      name="passType"
                      value={pass.id}
                      checked={selectedPass === pass.id}
                      onChange={() => setSelectedPass(pass.id)}
                      className="registration-pass-option__input"
                    />
                    <RegistrationPassCard
                      id={pass.id}
                      name={pass.name}
                      description={passDescriptions[pass.id] || 'Access to events and activities.'}
                      price={pass.id === 'group_events' ? (PASS_TYPES.GROUP_EVENTS.pricePerPerson ?? 250) : ((pass as { price?: number }).price ?? 0)}
                      priceLabel={pass.id === 'group_events' ? 'per person' : undefined}
                      icon={passIcons[pass.id] ?? passIcons.day_pass}
                      isSelected={selectedPass === pass.id}
                      variant="radio"
                      isMostPopular={pass.id === 'sana_concert'}
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="registration-selector-layout__right registration-right-panel">
            <div className="registration-right-panel__scroll">
              {!selectedPass && (
                <div className="registration-details-placeholder">
                  <p>Select a pass to see details and proceed to payment</p>
                </div>
              )}
              {selectedPass === 'group_events' && (
                <div className="registration-team-section">
                  <h3 className="registration-team-section__title">Team Details</h3>
                  <div className="registration-team-section__field">
                    <label className="registration-team-section__label">Team Name</label>
                    <input
                      type="text"
                      value={teamData.teamName}
                      onChange={(e) => setTeamData({ ...teamData, teamName: e.target.value })}
                      className="registration-team-section__input"
                      placeholder="Enter your team name"
                      required
                    />
                  </div>
                  <div className="registration-team-section__members">
                    {teamData.members.map((member, idx) => (
                      <div key={idx} className="registration-team-member">
                        <div className="registration-team-member__header">
                          <h4 className="registration-team-member__title">
                            Member {idx + 1}
                            {idx === 0 && <span className="registration-team-member__badge">You (Leader)</span>}
                          </h4>
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => removeMember(idx)}
                              className="registration-team-member__remove"
                              aria-label="Remove member"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="registration-team-member__fields">
                          <input
                            type="text"
                            placeholder="Member name"
                            value={member.name}
                            onChange={(e) => {
                              const newMembers = [...teamData.members];
                              newMembers[idx]!.name = e.target.value;
                              setTeamData({ ...teamData, members: newMembers });
                            }}
                            className="registration-team-member__input"
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
                            className="registration-team-member__input"
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
                      className="registration-team-section__add"
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

            <footer className="registration-right-panel__footer">
              <div className="registration-right-panel__summary">
                {selectedPass ? (
                  <>
                    <div className="registration-right-panel__summary-line">
                      <span className="registration-right-panel__pass-name">
                        {Object.values(PASS_TYPES).find((p) => p.id === selectedPass)?.name}
                      </span>
                      <span className="registration-right-panel__amount">₹{calculateAmount()}</span>
                    </div>
                    {selectedPass === 'group_events' && (
                      <p className="registration-right-panel__pass-details">{teamData.members.length} members × ₹250</p>
                    )}
                  </>
                ) : (
                  <p className="registration-right-panel__empty">Select a pass</p>
                )}
              </div>
              <div className="registration-right-panel__cta">
                {isLoading ? (
                  <div className="registration-right-panel__spinner">
                    <div className="reg-spinner w-5 h-5 border-2 border-white/30 border-t-white" />
                  </div>
                ) : (
                  <div className="registration-right-panel__btn-wrap">
                    <AwardBadge type="button" onClick={handlePayment} disabled={!selectedPass}>
                      PROCEED TO PAYMENT
                    </AwardBadge>
                  </div>
                )}
              </div>
              <p className="registration-right-panel__security">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secured by Cashfree
              </p>
            </footer>
          </div>
        </div>

        <div
          data-wf--spacer--section-space="main"
          className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
        />
      </main>
      <Footer />
    </>
  );
}
