'use client';

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/clientApp';
import { useAuth } from '@/features/auth/AuthContext';
import { openCashfreeCheckout } from '@/features/payments/cashfreeClient';
import { X } from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

// Test pass price
const TEST_PASS_AMOUNT = 1;

interface TestPassModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
}

export default function TestPassModal({
    isOpen,
    onCloseAction,
}: TestPassModalProps) {
    const { user } = useAuth();
    const overlayRef = useRef<HTMLDivElement>(null);

    // User info
    const [phone, setPhone] = useState('');
    const [college, setCollege] = useState('');

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Lock global body scroll (and Lenis) when modal is open
    useLockBodyScroll(isOpen);

    // Reset form when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setError(null);
        setPhone('');
        setCollege('');
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCloseAction();
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onCloseAction]);

    // Handle form submission
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Validate
        if (!phone.trim() || phone.trim().length < 10) {
            setError('Please enter a valid phone number');
            return;
        }
        if (!college.trim()) {
            setError('Please enter your college name');
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            const uid = user.uid;
            const email = user.email || user.providerData?.[0]?.email || '';
            const name = user.displayName || email || 'Attendee';

            // Update user document (allowed by rules)
            await setDoc(
                doc(db, 'users', uid),
                {
                    uid,
                    name,
                    email,
                    college: college.trim(),
                    phone: phone.trim(),
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            // Create payment order via server
            const token = await auth.currentUser?.getIdToken(true);
            if (!token) throw new Error('Not signed in');

            const res = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: uid,
                    passType: 'test_pass',
                    amount: TEST_PASS_AMOUNT,
                    selectedDays: [],
                    selectedEvents: [],
                    teamData: {
                        name,
                        email,
                        phone: phone.trim(),
                        college: college.trim(),
                    },
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to create order');
            }

            const data = (await res.json()) as { sessionId?: string; orderId?: string };
            const sessionId = data.sessionId;
            const orderId = data.orderId;
            if (!sessionId) throw new Error('No payment session');

            onCloseAction();
            const result = await openCashfreeCheckout(sessionId, orderId);

            if (result.success) {
                // Navigate to callback page to verify payment
                window.location.href = `/payment/callback?order_id=${orderId}`;
            } else {
                throw new Error(result.message || 'Payment failed');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    }, [user, phone, college, onCloseAction]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="test-pass-title"
            onClick={(e) => e.target === overlayRef.current && onCloseAction()}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
        >
            <div
                className="modal-content-scroll w-full max-w-lg max-h-[90vh] flex flex-col overflow-y-auto bg-[#1a1a1a] border border-neutral-800 shadow-2xl relative group"
                onClick={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
            >
                {/* --- Top + Header --- */}
                <div className="sticky top-0 z-20 bg-[#151515] border-b border-neutral-800">
                    <div className="h-6 w-full flex items-center justify-between px-2">
                        <div className="flex gap-2 text-[8px] tracking-[0.2em] text-neutral-500 uppercase font-bold font-orbitron">
                            <span>SYS.TEST.01</span>
                            <span>///</span>
                            <span>DEBUG MODE</span>
                        </div>
                        <button
                            type="button"
                            className="text-neutral-500 hover:text-white transition-colors"
                            aria-label="Close"
                            onClick={onCloseAction}
                        >
                            <X size={12} strokeWidth={1.5} />
                        </button>
                    </div>
                    <div className="px-6 pt-4 pb-4 bg-[#151515]">
                        <h2 id="test-pass-title" className="text-xl md:text-2xl font-bold text-white font-orbitron tracking-tight mb-2 uppercase">
                            🧪 Test Pass Registration
                        </h2>
                        <p className="text-xs text-neutral-500 font-mono">
                            // Minimal ₹1 pass for payment verification testing
                        </p>
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* Corner Accents */}
                        <div className="absolute top-6 right-6 w-3 h-3 border-t border-r border-neutral-600 pointer-events-none" />
                        <div className="absolute bottom-6 left-6 w-3 h-3 border-b border-l border-neutral-600 pointer-events-none" />

                        {/* Info Banner */}
                        <div className="p-4 bg-[#151515] border border-yellow-900/50 flex items-start gap-3">
                            <div className="w-1 h-full min-h-[2rem] bg-yellow-700" />
                            <div>
                                <p className="text-yellow-200 text-sm font-orbitron tracking-wide uppercase mb-1">
                                    Testing Mode Active
                                </p>
                                <p className="text-yellow-500/70 text-xs font-mono">
                                    This test pass is for payment verification only. ₹1 will be charged to test the complete payment flow.
                                </p>
                            </div>
                        </div>

                        {/* User Identity */}
                        <div className="p-4 bg-[#151515] border border-neutral-800 flex items-start gap-3">
                            <div className="w-1 h-full min-h-[2rem] bg-neutral-700" />
                            <div>
                                <p className="text-neutral-300 text-sm font-orbitron tracking-wide uppercase mb-1">
                                    Personal Identity
                                </p>
                                <p className="text-neutral-500 text-xs font-mono">
                                    // {user?.displayName || user?.email}
                                </p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <div className="group/input">
                                <label htmlFor="test-phone" className="mb-2 block text-xs text-neutral-500 font-orbitron tracking-widest uppercase">
                                    Comms Frequency (Phone) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="test-phone"
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="0000000000"
                                    className="w-full bg-[#0a0a0a] border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-700 text-sm font-mono focus:border-neutral-500 focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="group/input">
                                <label htmlFor="test-college" className="mb-2 block text-xs text-neutral-500 font-orbitron tracking-widest uppercase">
                                    Affiliation (College) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="test-college"
                                    type="text"
                                    required
                                    value={college}
                                    onChange={(e) => setCollege(e.target.value)}
                                    placeholder="INSTITUTE NAME"
                                    className="w-full bg-[#0a0a0a] border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-700 text-sm font-mono focus:border-neutral-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Pricing Display */}
                        <div className="p-4 bg-[#151515] border border-neutral-700 relative overflow-hidden">
                            {/* Diagonal lines bg */}
                            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 10px)' }}></div>

                            <div className="relative z-10 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-neutral-500 font-orbitron uppercase mb-1">Total Assessment</p>
                                    <div className="text-xs text-neutral-400 font-mono">
                                        TEST PASS × ₹1
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-white font-orbitron tracking-tighter">
                                    ₹{TEST_PASS_AMOUNT}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error + Actions - sticky bottom */}
                    <div className="sticky bottom-0 z-20 bg-[#151515] border-t border-neutral-800">
                        <div className="px-6 pb-4 pt-4 space-y-4">
                            {error && (
                                <div className="border border-red-900/50 bg-red-900/10 p-3 flex items-start gap-2">
                                    <div className="w-1 h-3 mt-1 bg-red-500 shrink-0" />
                                    <p className="text-xs text-red-200 font-mono uppercase tracking-wide">
                                        ERROR: {error}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={onCloseAction}
                                    disabled={submitting}
                                    className="flex-1 border border-neutral-700 py-3 text-xs font-bold text-neutral-400 font-orbitron uppercase hover:bg-neutral-800 transition disabled:opacity-50 tracking-widest"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 border border-neutral-700 py-3 text-xs font-bold text-neutral-400 font-orbitron uppercase hover:bg-neutral-800 transition disabled:opacity-50 tracking-widest"
                                >
                                    {submitting ? 'PROCESSING...' : `INITIATE PAYMENT ₹1`}
                                </button>
                            </div>
                        </div>

                        {/* --- Bottom Border Strip --- */}
                        <div className="h-4 w-full flex items-center justify-end px-2 border-t border-neutral-800 bg-[#151515] text-[6px] text-neutral-600 font-orbitron uppercase">
                            <span>TEST MODE - SECURE CONNECTION ESTABLISHED</span>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
