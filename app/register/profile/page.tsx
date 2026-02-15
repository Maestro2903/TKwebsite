'use client';

import { useAuth } from '@/features/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Footer from '@/components/layout/Footer';
import { AwardBadge } from '@/components/decorative/AwardBadge';
import { auth } from '@/lib/firebase/clientApp';
import { REFERRAL_STORAGE_KEY } from '@/hooks/useReferralCapture';

export default function ProfilePage() {
    const { user, userData, loading: authLoading, updateUserProfile } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', college: '', phone: '' });
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

            // Apply referral if present (silently ignore errors)
            const referralCode = typeof localStorage !== 'undefined' ? localStorage.getItem(REFERRAL_STORAGE_KEY) : null;
            if (referralCode && user) {
                try {
                    const token = await auth.currentUser?.getIdToken(true);
                    if (token) {
                        const res = await fetch('/api/referral/apply', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ referralCode }),
                        });
                        if (res.ok) {
                            localStorage.removeItem(REFERRAL_STORAGE_KEY);
                        }
                    }
                } catch {
                    // Silently ignore - profile is saved, don't block navigation
                }
            }

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

    // Already has profile - show redirect message
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
