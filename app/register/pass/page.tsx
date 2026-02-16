'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import Footer from '@/components/layout/Footer';
import RegistrationPassesGrid from '@/components/sections/registration/RegistrationPassesGrid';
import GroupRegistrationModal from '@/components/sections/registration/GroupRegistrationModal';
import DayPassModal from '@/components/sections/registration/DayPassModal';
import ProshowModal from '@/components/sections/registration/ProshowModal';
import AllAccessModal from '@/components/sections/registration/AllAccessModal';
import { openCashfreeCheckout } from '@/features/payments/cashfreeClient';
import type { RegistrationPass } from '@/data/passes';
import Font1Text from '@/components/ui/Font1Text';
import { auth } from '@/lib/firebase/clientApp';

export default function PassSelectionPage() {
    const router = useRouter();
    const { user, userData, loading: authLoading } = useAuth();
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isDayPassModalOpen, setIsDayPassModalOpen] = useState(false);
    const [isProshowModalOpen, setIsProshowModalOpen] = useState(false);
    const [isAllAccessModalOpen, setIsAllAccessModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Redirect based on auth state - use useEffect to avoid setState during render
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        if (!userData) {
            router.push('/register/profile');
            return;
        }
    }, [authLoading, user, userData, router]);

    const handleRegisterClick = async (pass: RegistrationPass) => {
        // Extra safety: ensure profile is complete before opening any modal
        if (!userData) {
            router.push('/register/profile');
            return;
        }

        if (pass.passType === 'group_events') {
            setIsGroupModalOpen(true);
            return;
        }

        if (pass.passType === 'day_pass') {
            setIsDayPassModalOpen(true);
            return;
        }

        if (pass.passType === 'proshow') {
            setIsProshowModalOpen(true);
            return;
        }

        if (pass.passType === 'sana_concert') {
            setIsAllAccessModalOpen(true);
            return;
        }

        // Fallback for any other pass types (should not happen with current setup)
        console.error('Unknown pass type:', pass.passType);
        alert('This pass type is not yet available. Please contact support.');
    };

    const handleGroupModalClose = () => {
        setIsGroupModalOpen(false);
    };

    const handleDayPassModalClose = () => {
        setIsDayPassModalOpen(false);
    };

    const handleProshowModalClose = () => {
        setIsProshowModalOpen(false);
    };

    const handleAllAccessModalClose = () => {
        setIsAllAccessModalOpen(false);
    };

    // Invite-unlock: referral link for sharing
    const [referralLink, setReferralLink] = useState<string | null>(null);
    const [referralCopied, setReferralCopied] = useState(false);
    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        (async () => {
            try {
                const token = await auth.currentUser?.getIdToken(true);
                if (!token || cancelled) return;
                const res = await fetch('/api/users/referral-code', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok || cancelled) return;
                const data = await res.json();
                if (data.referralCode) {
                    const base =
                        typeof window !== 'undefined'
                            ? window.location.origin
                            : (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://takshashila26.vercel.app')?.replace(/\/$/, '');
                    setReferralLink(`${base}?ref=${data.referralCode}`);
                }
            } catch {
                // Silently ignore
            }
        })();
        return () => { cancelled = true; };
    }, [user]);

    const copyReferralLink = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink).then(() => {
            setReferralCopied(true);
            setTimeout(() => setReferralCopied(false), 2000);
        });
    };

    // Show loading while checking auth or waiting for redirect
    if (authLoading || !user || !userData || submitting) {
        return (
            <>
                <main className="page_main page_main--registration registration-loading">
                    <div className="registration-loading__spinner">
                        <div className="reg-spinner" />
                        <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>
                            {submitting ? 'Processing payment...' : 'Loading...'}
                        </p>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <main id="main" className="page_main page_main--registration u-container py-[var(--_spacing---section-space--large)]">
                {/* Header Section */}
                <section className="text-center mb-8">
                    <p className="text-sm tracking-widest uppercase text-white/60 mb-4">
                        CIT TAKSHASHILA 2026
                    </p>
                    <div className="mb-8">
                        <Font1Text text="CHOOSE YOUR PASS" height={50} className="md:h-[60px]" />
                    </div>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto">
                        Select the pass that best fits your festival experience. All passes include access to campus activities and events.
                    </p>
                </section>

                {/* User Info */}
                {userData && (
                    <section className="text-center mb-12">
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/15 bg-white/5">
                            <span className="text-sm text-white/60">Registering as:</span>
                            <span className="text-sm font-medium text-white">
                                {userData.name || user?.displayName || user?.email || 'User'}
                            </span>
                        </div>
                    </section>
                )}

                {/* Invite 5 friends – referral link */}
                {referralLink && (
                    <section className="mb-12 p-4 sm:p-6 border border-blue-900/50 bg-blue-950/20 rounded-lg">
                        <p className="text-sm font-medium text-white mb-2">
                            Invite 5 friends who complete their profile to unlock Day Pass at ₹500
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                            <input
                                type="text"
                                readOnly
                                value={referralLink}
                                className="flex-1 px-4 py-2 bg-[#0a0a0a] border border-neutral-700 rounded text-sm text-white font-mono truncate"
                            />
                            <button
                                type="button"
                                onClick={copyReferralLink}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded transition whitespace-nowrap"
                            >
                                {referralCopied ? 'Copied!' : 'Copy link'}
                            </button>
                        </div>
                    </section>
                )}

                {/* Passes Grid */}
                <RegistrationPassesGrid
                    onRegisterClick={handleRegisterClick}
                    dayPassUnlocked={userData?.dayPassUnlocked}
                />

                {/* Already have a pass? */}
                <section className="text-center mt-16">
                    <p className="text-white/60 mb-4">Already registered?</p>
                    <button
                        type="button"
                        onClick={() => router.push('/register/my-pass')}
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white border border-white/30 rounded hover:bg-white/5 transition"
                    >
                        View My Pass
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </section>
            </main>

            {/* Group Registration Modal */}
            <GroupRegistrationModal
                isOpen={isGroupModalOpen}
                onCloseAction={handleGroupModalClose}
            />

            {/* Day Pass Modal */}
            <DayPassModal
                isOpen={isDayPassModalOpen}
                onCloseAction={handleDayPassModalClose}
            />

            {/* Proshow Pass Modal */}
            <ProshowModal
                isOpen={isProshowModalOpen}
                onCloseAction={handleProshowModalClose}
            />

            {/* All Access Pass Modal */}
            <AllAccessModal
                isOpen={isAllAccessModalOpen}
                onCloseAction={handleAllAccessModalClose}
            />

            <Footer />
        </>
    );
}
