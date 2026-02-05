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

// Pass descriptions
const passDescriptions: Record<string, string> = {
    day_pass: 'Access to all technical and non-technical events for one day.',
    group_events: 'Perfect for team competitions. Register your entire team.',
    proshow: 'Access to Day 1 and Day 3 proshows with premium seating.',
    sana_concert: 'All-access pass including SANA concert and all 3-day events.',
};

// Pass Card Component - Ticket Style Design
interface PassCardProps {
    id: string;
    name: string;
    description: string;
    price: number;
    priceLabel?: string;
    isSelected: boolean;
    isMostPopular?: boolean;
}

function PassCard({ id, name, description, price, priceLabel, isSelected, isMostPopular }: PassCardProps) {
    return (
        <span className={`ticket-card ${isSelected ? 'ticket-card--selected' : ''} ${isMostPopular ? 'ticket-card--popular' : ''}`}>
            {/* Left Side - Price Section */}
            <span className="ticket-card__left">
                <span className="ticket-card__price">
                    <span className="ticket-card__price-currency">₹</span>
                    <span className="ticket-card__price-amount">{price}</span>
                </span>
                {priceLabel && (
                    <span className="ticket-card__price-label">{priceLabel}</span>
                )}
                {/* Ticket cutouts */}
                <span className="ticket-card__cutout ticket-card__cutout--top" aria-hidden />
                <span className="ticket-card__cutout ticket-card__cutout--bottom" aria-hidden />
            </span>

            {/* Right Side - Content Section */}
            <span className="ticket-card__right">
                {isMostPopular && (
                    <span className="ticket-card__badge">Best Value</span>
                )}
                <span className="ticket-card__name">{name}</span>
                <span className="ticket-card__description">{description}</span>

                {/* Selection indicator */}
                <span className="ticket-card__action">
                    <span className={`ticket-card__select-btn ${isSelected ? 'ticket-card__select-btn--active' : ''}`}>
                        {isSelected ? 'Selected' : 'Select'}
                    </span>
                </span>
            </span>
        </span>
    );
}

export default function PassPage() {
    useLenis();
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [selectedPass, setSelectedPass] = useState<string>('');
    const [teamData, setTeamData] = useState({
        teamName: '',
        members: [{ name: '', phone: '' }],
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

        // No profile - go to profile page
        if (!userData) {
            router.push('/register/profile');
        }
    }, [user, userData, authLoading, router]);

    // Load Cashfree SDK
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (script.parentNode) document.body.removeChild(script);
        };
    }, []);

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

    // Not signed in or no profile - show redirect message
    if (!user || !userData) {
        return (
            <>
                <Navigation />
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

    // Pass selection page
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

                    {/* Pass Cards and Order Summary Grid */}
                    <div className="registration-passes-v2__grid">
                        {Object.entries(PASS_TYPES).map(([key, pass]) => (
                            <label
                                key={key}
                                className="ticket-card-option"
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
                                    className="ticket-card-input"
                                />
                                <PassCard
                                    id={pass.id}
                                    name={pass.name}
                                    description={passDescriptions[pass.id] || 'Access to events and activities.'}
                                    price={pass.id === 'group_events' ? (PASS_TYPES.GROUP_EVENTS.pricePerPerson ?? 250) : ((pass as { price?: number }).price ?? 0)}
                                    priceLabel={pass.id === 'group_events' ? 'per person' : undefined}
                                    isSelected={selectedPass === pass.id}
                                    isMostPopular={pass.id === 'sana_concert'}
                                />
                            </label>
                        ))}

                        {/* Order Summary - In Same Grid */}
                        <aside className="order-summary-card">
                            <h2 className="order-summary-card__title">Order Summary</h2>

                            {!selectedPass ? (
                                <div className="order-summary-card__empty">
                                    <div className="order-summary-card__empty-icon">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                        </svg>
                                    </div>
                                    <p className="order-summary-card__empty-text">Select a pass to begin</p>
                                </div>
                            ) : (
                                <>
                                    <div className="order-summary-card__selected">
                                        <h3 className="order-summary-card__pass-name">{selectedPassConfig?.name}</h3>
                                        {selectedPass === 'group_events' && (
                                            <p className="order-summary-card__pass-details">{teamData.members.length} members × ₹250</p>
                                        )}
                                    </div>

                                    <div className="order-summary-card__total">
                                        <span className="order-summary-card__total-label">Total</span>
                                        <span className="order-summary-card__total-amount">₹{calculateAmount()}</span>
                                    </div>

                                    <div className="order-summary-card__cta">
                                        {isLoading ? (
                                            <div className="flex justify-center items-center h-[54px]">
                                                <div className="reg-spinner w-5 h-5 border-2 border-white/30 border-t-white" />
                                            </div>
                                        ) : (
                                            <div className="order-summary-card__cta-btn-wrap">
                                                <AwardBadge type="button" onClick={handlePayment}>
                                                    PROCEED TO PAYMENT
                                                </AwardBadge>
                                            </div>
                                        )}
                                    </div>

                                    <p className="order-summary-card__security">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Secured by Cashfree
                                    </p>
                                </>
                            )}
                        </aside>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
