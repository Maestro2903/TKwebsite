'use client';

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/clientApp';
import { useAuth } from '@/features/auth/AuthContext';
import { openCashfreeCheckout } from '@/features/payments/cashfreeClient';
import { X } from 'lucide-react';

// Price per day
const PRICE_PER_DAY = 500;

interface DayOption {
    id: string;
    date: string;
    label: string;
}

const DAY_OPTIONS: DayOption[] = [
    { id: 'day1', date: '2026-02-26', label: '26 Feb' },
    { id: 'day2', date: '2026-02-27', label: '27 Feb' },
    { id: 'day3', date: '2026-02-28', label: '28 Feb' },
];

interface DayPassModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DayPassModal({
    isOpen,
    onClose,
}: DayPassModalProps) {
    const { user } = useAuth();
    const overlayRef = useRef<HTMLDivElement>(null);

    // User info
    const [phone, setPhone] = useState('');
    const [college, setCollege] = useState('');

    // Selected days
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'days' | 'details' | 'review'>('days');

    // Reset form when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setError(null);
        setPhone('');
        setCollege('');
        setSelectedDays([]);
        setStep('days');
    }, [isOpen]);

    // Handle escape key and body scroll
    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Calculate total
    const totalDays = selectedDays.length;
    const totalAmount = totalDays * PRICE_PER_DAY;

    // Toggle day selection
    const toggleDay = useCallback((dayId: string) => {
        setSelectedDays((prev) =>
            prev.includes(dayId)
                ? prev.filter((id) => id !== dayId)
                : [...prev, dayId]
        );
    }, []);

    // Validate current step
    const validateStep = useCallback(() => {
        if (step === 'days') {
            if (selectedDays.length === 0) {
                setError('Please select at least one day');
                return false;
            }
        }
        if (step === 'details') {
            if (!phone.trim() || phone.trim().length < 10) {
                setError('Please enter a valid phone number');
                return false;
            }
            if (!college.trim()) {
                setError('Please enter your college name');
                return false;
            }
        }
        setError(null);
        return true;
    }, [step, selectedDays, phone, college]);

    // Handle step navigation
    const goToNextStep = useCallback(() => {
        if (!validateStep()) return;
        if (step === 'days') setStep('details');
        else if (step === 'details') setStep('review');
    }, [step, validateStep]);

    const goToPrevStep = useCallback(() => {
        if (step === 'details') setStep('days');
        else if (step === 'review') setStep('details');
    }, [step]);

    // Handle form submission
    const handleSubmit = useCallback(async () => {
        if (!user) return;
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

            // Get selected day dates
            const selectedDates = selectedDays.map(
                (dayId) => DAY_OPTIONS.find((d) => d.id === dayId)?.date
            ).filter(Boolean);

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
                    passType: 'day_pass',
                    amount: totalAmount,
                    selectedDays: selectedDates,
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

            onClose();
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
    }, [user, phone, college, selectedDays, totalAmount, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-pass-title"
            onClick={(e) => e.target === overlayRef.current && onClose()}
        >
            <div
                className="w-full max-w-lg max-h-[90vh] overflow-y-auto overscroll-contain bg-[#1a1a1a] border border-neutral-800 shadow-2xl relative group"
                onClick={(e) => e.stopPropagation()}
            >
                {/* --- Top Tech Border --- */}
                <div className="h-6 w-full flex items-center justify-between px-2 border-b border-neutral-800 bg-[#151515] sticky top-0 z-20">
                    <div className="flex gap-2 text-[8px] tracking-[0.2em] text-neutral-500 uppercase font-bold font-orbitron">
                        <span>SYS.DAY.01</span>
                        <span>///</span>
                        <span>SECURE</span>
                    </div>
                    <button
                        type="button"
                        className="text-neutral-500 hover:text-white transition-colors"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        <X size={12} strokeWidth={1.5} />
                    </button>
                </div>

                <div className="p-6 relative">
                    {/* Corner Accents */}
                    <div className="absolute top-6 right-6 w-3 h-3 border-t border-r border-neutral-600 pointer-events-none" />
                    <div className="absolute bottom-6 left-6 w-3 h-3 border-b border-l border-neutral-600 pointer-events-none" />

                    {/* Header */}
                    <div className="mb-8">
                        <h2 id="day-pass-title" className="text-xl md:text-2xl font-bold text-white font-orbitron tracking-tight mb-2 uppercase">
                            Day Pass Registration
                        </h2>
                        <div className="flex items-center gap-3 text-[10px] tracking-widest text-neutral-500 uppercase font-orbitron">
                            <span>Step {step === 'days' ? '01' : step === 'details' ? '02' : '03'}</span>
                            <div className="h-[1px] flex-1 bg-neutral-800"></div>
                            <span>Total Steps: 03</span>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-8 h-[2px] w-full bg-neutral-800">
                        <div
                            className="h-full bg-neutral-400 transition-all duration-300 relative"
                            style={{
                                width: step === 'days' ? '33%' : step === 'details' ? '66%' : '100%',
                            }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        </div>
                    </div>

                    {/* Step 1: Select Days */}
                    {step === 'days' && (
                        <div className="space-y-6">
                            <div className="p-4 bg-[#151515] border border-neutral-800 flex items-start gap-3">
                                <div className="w-1 h-full min-h-[2rem] bg-neutral-700" />
                                <div>
                                    <p className="text-neutral-300 text-sm font-orbitron tracking-wide uppercase mb-1">
                                        Select Access Days
                                    </p>
                                    <p className="text-neutral-500 text-xs font-mono">
                                        // Choose one or more days for event access
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {DAY_OPTIONS.map((day) => (
                                    <button
                                        key={day.id}
                                        type="button"
                                        onClick={() => toggleDay(day.id)}
                                        className={`w-full p-4 border transition-all duration-300 flex items-center justify-between group/day ${selectedDays.includes(day.id)
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-neutral-800 bg-[#0a0a0a] hover:border-neutral-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${selectedDays.includes(day.id)
                                                    ? 'border-blue-500 bg-blue-500/20'
                                                    : 'border-neutral-600 bg-neutral-900'
                                                }`}>
                                                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${selectedDays.includes(day.id) ? 'bg-blue-500' : 'bg-transparent'
                                                    }`} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-white font-orbitron text-sm tracking-wide uppercase">
                                                    {day.label}
                                                </p>
                                                <p className="text-neutral-500 text-xs font-mono">
                                                    Day {day.id.replace('day', '')} Access
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-white font-orbitron text-sm">
                                            ₹{PRICE_PER_DAY}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {selectedDays.length > 0 && (
                                <div className="p-4 bg-[#151515] border border-neutral-700 flex justify-between items-center">
                                    <span className="text-xs text-neutral-400 font-mono">
                                        {selectedDays.length} day{selectedDays.length > 1 ? 's' : ''} selected
                                    </span>
                                    <span className="text-lg font-bold text-white font-orbitron">
                                        ₹{totalAmount}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: User Details */}
                    {step === 'details' && (
                        <div className="space-y-6">
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

                            <div className="space-y-4">
                                <div className="group/input">
                                    <label htmlFor="day-phone" className="mb-2 block text-xs text-neutral-500 font-orbitron tracking-widest uppercase">
                                        Comms Frequency (Phone) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="day-phone"
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="0000000000"
                                        className="w-full bg-[#0a0a0a] border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-700 text-sm font-mono focus:border-neutral-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div className="group/input">
                                    <label htmlFor="day-college" className="mb-2 block text-xs text-neutral-500 font-orbitron tracking-widest uppercase">
                                        Affiliation (College) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="day-college"
                                        type="text"
                                        required
                                        value={college}
                                        onChange={(e) => setCollege(e.target.value)}
                                        placeholder="INSTITUTE NAME"
                                        className="w-full bg-[#0a0a0a] border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-700 text-sm font-mono focus:border-neutral-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review & Pay */}
                    {step === 'review' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-orbitron text-white uppercase tracking-wider mb-4">Registration Summary</h3>

                                <div className="border border-neutral-800 bg-[#0a0a0a] divide-y divide-neutral-800">
                                    <div className="p-3 flex justify-between items-center">
                                        <span className="text-[10px] text-neutral-500 font-orbitron uppercase">User ID</span>
                                        <div className="text-right">
                                            <div className="text-sm text-white font-mono">{user?.displayName || user?.email}</div>
                                            <div className="text-[10px] text-neutral-600 font-mono">{phone}</div>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] text-neutral-500 font-orbitron uppercase">Selected Days</span>
                                            <span className="text-[10px] text-neutral-500 font-mono">{selectedDays.length} Day{selectedDays.length > 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="space-y-1 pl-2 border-l border-neutral-800">
                                            {selectedDays.map((dayId) => {
                                                const day = DAY_OPTIONS.find((d) => d.id === dayId);
                                                return (
                                                    <div key={dayId} className="flex justify-between text-xs font-mono">
                                                        <span className="text-neutral-400">{day?.label}</span>
                                                        <span className="text-neutral-500">₹{PRICE_PER_DAY}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
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
                                            {totalDays} DAY{totalDays > 1 ? 'S' : ''} × ₹{PRICE_PER_DAY}
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-white font-orbitron tracking-tighter">
                                        ₹{totalAmount}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mt-6 border border-red-900/50 bg-red-900/10 p-3 flex items-start gap-2">
                            <div className="w-1 h-3 mt-1 bg-red-500 shrink-0" />
                            <p className="text-xs text-red-200 font-mono uppercase tracking-wide">
                                ERROR: {error}
                            </p>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-8 pt-4 border-t border-neutral-800">
                        {step !== 'days' && (
                            <button
                                type="button"
                                onClick={goToPrevStep}
                                disabled={submitting}
                                className="flex-1 border border-neutral-700 py-3 text-xs font-bold text-neutral-400 font-orbitron uppercase hover:bg-neutral-800 transition disabled:opacity-50 tracking-widest"
                            >
                                Back
                            </button>
                        )}
                        {step === 'days' && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 border border-neutral-700 py-3 text-xs font-bold text-neutral-400 font-orbitron uppercase hover:bg-neutral-800 transition tracking-widest"
                            >
                                Abort
                            </button>
                        )}
                        {step !== 'review' ? (
                            <button
                                type="button"
                                onClick={goToNextStep}
                                className="flex-1 bg-black text-white border border-white py-3 text-xs font-bold font-orbitron uppercase hover:bg-neutral-800 transition tracking-widest"
                            >
                                Proceed
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 bg-white text-black border border-white py-3 text-xs font-bold font-orbitron uppercase hover:bg-neutral-200 transition disabled:opacity-50 tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                            >
                                {submitting ? 'PROCESSING...' : `INITIATE PAYMENT`}
                            </button>
                        )}
                    </div>
                </div>

                {/* --- Bottom Border Strip --- */}
                <div className="h-4 w-full flex items-center justify-end px-2 border-t border-neutral-800 bg-[#151515] text-[6px] text-neutral-600 font-orbitron uppercase">
                    <span>SECURE CONNECTION ESTABLISHED</span>
                </div>
            </div>
        </div>
    );
}
