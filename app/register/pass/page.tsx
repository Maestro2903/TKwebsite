'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { useLenis } from '@/hooks/useLenis';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import RegistrationPassesGrid from '@/components/sections/registration/RegistrationPassesGrid';
import GroupRegistrationModal from '@/components/sections/registration/GroupRegistrationModal';
import { openCashfreeCheckout } from '@/features/payments/cashfreeClient';
import type { RegistrationPass } from '@/data/passes';
import Font1Text from '@/components/ui/Font1Text';

export default function PassSelectionPage() {
    useLenis();
    const router = useRouter();
    const { user, userData, loading: authLoading } = useAuth();
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
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
        if (pass.passType === 'group_events') {
            setIsGroupModalOpen(true);
            return;
        }

        if (!user || !userData) return;

        setSubmitting(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.uid,
                    passType: pass.passType,
                    amount: pass.amount,
                    teamData: {
                        uid: user.uid,
                        name: userData.name,
                        email: userData.email,
                        phone: userData.phone,
                        college: userData.college || '',
                    }
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to create order');
            }

            const { sessionId, orderId } = await res.json();
            if (!sessionId || !orderId) throw new Error('Invalid server response');

            // Redirect to Cashfree - this will eventually return to /payment/callback
            await openCashfreeCheckout(sessionId, orderId);
        } catch (err) {
            console.error('Payment error:', err);
            alert(err instanceof Error ? err.message : 'Payment initialization failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGroupModalClose = () => {
        setIsGroupModalOpen(false);
    };

    // Show loading while checking auth or waiting for redirect
    if (authLoading || !user || !userData || submitting) {
        return (
            <>
                <Navigation />
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
            <Navigation />
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
                            <span className="text-sm font-medium text-white">{userData.name || user?.displayName || user?.email}</span>
                        </div>
                    </section>
                )}

                {/* Passes Grid */}
                <RegistrationPassesGrid onRegisterClick={handleRegisterClick} />

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
                onClose={handleGroupModalClose}
            />

            <Footer />
        </>
    );
}
