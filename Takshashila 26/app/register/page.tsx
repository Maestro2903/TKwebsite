'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PASS_TYPES } from '@/lib/types';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

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

export default function RegisterPage() {
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
        const teamRef = await addDoc(collection(db, 'teams'), {
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

      await addDoc(collection(db, 'payments'), {
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
        <main className="page_main min-h-[60vh] flex items-center justify-center u-container py-16">
          <div className="reg-spinner" />
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navigation />
        <main className="page_main min-h-[60vh] flex flex-col items-center justify-center u-container py-16">
          <p className="text-white/80 mb-6">Sign in to register for passes.</p>
          <button
            type="button"
            onClick={() => signIn()}
            className="rounded bg-white px-6 py-3 font-semibold text-black hover:opacity-90"
          >
            Sign in with Google
          </button>
        </main>
        <Footer />
      </>
    );
  }

  if (step === 'profile') {
    return (
      <>
        <Navigation />
        <main className="page_main min-h-[60vh] flex items-center justify-center p-4">
          <div className="reg-gradient-bg rounded-3xl p-8 w-full max-w-md">
            <div className="reg-glass-card p-10 w-full max-w-md mx-auto">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Complete Your Profile</h2>
              <p className="text-center text-gray-500 mb-8">We need a few details to get you started</p>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="reg-input-field"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">College Name</label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="reg-input-field"
                    placeholder="Enter your college name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="reg-input-field"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="reg-btn-primary w-full flex items-center justify-center gap-2 mt-6"
                >
                  {isLoading ? (
                    <div className="reg-spinner w-5 h-5 border-2" />
                  ) : (
                    <>
                      Continue
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="page_main min-h-[60vh]">
        <div className="min-h-[60vh] bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
          <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                CIT Takshashila 2026
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 text-sm hidden sm:block">{userData?.name}</span>
                <button
                  type="button"
                  onClick={() => router.push('/register/my-pass')}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  My Pass
                </button>
                <button type="button" onClick={signOut} className="text-gray-500 hover:text-gray-700" aria-label="Sign out">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Select Your Pass</h2>
              <p className="text-gray-500">Choose from our exclusive event packages</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {Object.entries(PASS_TYPES).map(([key, pass]) => (
                <div
                  key={key}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPass(pass.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedPass(pass.id)}
                  className={`reg-pass-card ${selectedPass === pass.id ? 'selected' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${selectedPass === pass.id ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                      {passIcons[pass.id] ?? passIcons.day_pass}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{pass.name}</h3>
                      <div className="mt-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          ₹{pass.id === 'group_events' ? PASS_TYPES.GROUP_EVENTS.pricePerPerson : (pass as { price?: number }).price}
                        </span>
                        {pass.id === 'group_events' && (
                          <span className="text-gray-500 text-sm ml-1">per person</span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedPass === pass.id ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                        }`}
                    >
                      {selectedPass === pass.id && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedPass === 'group_events' && (
              <div className="reg-glass-card p-8 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Team Details
                </h3>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
                  <input
                    type="text"
                    value={teamData.teamName}
                    onChange={(e) => setTeamData({ ...teamData, teamName: e.target.value })}
                    className="reg-input-field"
                    placeholder="Enter your team name"
                    required
                  />
                </div>
                <div className="space-y-4">
                  {teamData.members.map((member, idx) => (
                    <div key={idx} className="reg-member-card relative">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-700">
                          Member {idx + 1}
                          {idx === 0 && <span className="ml-2 reg-badge reg-badge-success text-xs">You (Leader)</span>}
                        </h4>
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => removeMember(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Member name"
                          value={member.name}
                          onChange={(e) => {
                            const newMembers = [...teamData.members];
                            newMembers[idx]!.name = e.target.value;
                            setTeamData({ ...teamData, members: newMembers });
                          }}
                          className="reg-input-field"
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
                          className="reg-input-field"
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
                    className="mt-4 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Team Member ({teamData.members.length}/6)
                  </button>
                )}
              </div>
            )}

            {selectedPass && (
              <div className="reg-glass-card p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Payment Summary</h3>
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-800">
                      {Object.values(PASS_TYPES).find((p) => p.id === selectedPass)?.name}
                    </p>
                    {selectedPass === 'group_events' && (
                      <p className="text-sm text-gray-500">{teamData.members.length} members × ₹250</p>
                    )}
                  </div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ₹{calculateAmount()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="reg-btn-success w-full mt-6 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="reg-spinner w-5 h-5 border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Proceed to Secure Payment
                    </>
                  )}
                </button>
                <p className="text-center text-gray-400 text-sm mt-4 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secured by Cashfree
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
