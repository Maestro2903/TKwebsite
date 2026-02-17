'use client';

import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { auth } from '@/lib/firebase/clientApp';
import { useAuth } from '@/features/auth/AuthContext';
import { openCashfreeCheckout } from '@/features/payments/cashfreeClient';
import { X } from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { getAllConflicts, type EventWithTiming } from '@/lib/utils/eventConflicts';

// Fixed price for all-access pass
const ALL_ACCESS_PRICE = 2000;

// All 3 days
const ALL_DAYS = [
    { id: 'day1', date: '2026-02-26', label: '26 Feb' },
    { id: 'day2', date: '2026-02-27', label: '27 Feb' },
    { id: 'day3', date: '2026-02-28', label: '28 Feb' },
];

interface AllAccessModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
}

export default function AllAccessModal({
    isOpen,
    onCloseAction,
}: AllAccessModalProps) {
    const { user, userData } = useAuth();
    const overlayRef = useRef<HTMLDivElement>(null);

    // Events grouped by day
    const [eventsByDay, setEventsByDay] = useState<Record<string, any[]>>({});
    const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'events' | 'review'>('events');

    // Reset form when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setError(null);
        setSelectedEventIds([]);
        setEventsByDay({});
        setStep('events');
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

    // Lock global body scroll (and Lenis) when modal is open
    useLockBodyScroll(isOpen);

    // Calculate conflicting events based on current selection
    const conflictingEventIds = useMemo(() => {
        if (selectedEventIds.length === 0) {
            return new Set<string>();
        }
        // Flatten all events from all days
        const allEvents = Object.values(eventsByDay).flat() as EventWithTiming[];
        const selectedEvents = allEvents.filter(e =>
            selectedEventIds.includes(e.id)
        );
        return getAllConflicts(selectedEvents, allEvents);
    }, [selectedEventIds, eventsByDay]);

    // Fetch events for all 3 days
    useEffect(() => {
        if (!isOpen) return;

        const fetchEvents = async () => {
            setLoadingEvents(true);
            setError(null);
            try {
                // Fetch events for all days
                const eventPromises = ALL_DAYS.map(day =>
                    fetch(`/api/events?date=${day.date}&passType=sana_concert`)
                        .then(r => r.json())
                        .then(data => ({ dayId: day.id, events: data.events || [] }))
                );

                const results = await Promise.all(eventPromises);

                // Group events by day
                const grouped: Record<string, any[]> = {};
                results.forEach(({ dayId, events }) => {
                    grouped[dayId] = events;
                });

                setEventsByDay(grouped);
            } catch (err) {
                console.error('Failed to fetch events:', err);
                setError('Failed to load events. Please try again.');
            } finally {
                setLoadingEvents(false);
            }
        };

        fetchEvents();
    }, [isOpen]);

    // Validate current step
    const validateStep = useCallback(() => {
        if (step === 'events') {
            if (selectedEventIds.length === 0) {
                setError('Please select at least one event');
                return false;
            }
        }
        setError(null);
        return true;
    }, [step, selectedEventIds]);

    // Handle step navigation
    const goToNextStep = useCallback(() => {
        if (!validateStep()) return;
        if (step === 'events') setStep('review');
    }, [step, validateStep]);

    const goToPrevStep = useCallback(() => {
        if (step === 'review') setStep('events');
    }, [step]);

    // Handle form submission
    const handleSubmit = useCallback(async () => {
        if (!user) return;
        if (!userData) {
            setError('Profile incomplete. Please complete your profile first.');
            return;
        }
        setError(null);
        setSubmitting(true);

        try {
            const uid = user.uid;
            const email = user.email || user.providerData?.[0]?.email || '';
            const name = userData.name || user.displayName || email || 'Attendee';

            // Get all dates
            const allDates = ALL_DAYS.map(d => d.date);

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
                    passType: 'sana_concert',
                    amount: ALL_ACCESS_PRICE,
                    selectedDays: allDates,
                    selectedEvents: selectedEventIds,
                    teamData: {
                        name,
                        email: userData.email ?? email,
                        phone: userData.phone ?? '',
                        college: userData.college ?? '',
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
    }, [user, userData, selectedEventIds, onCloseAction]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="all-access-pass-title"
            onClick={(e) => e.target === overlayRef.current && onCloseAction()}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
        >
            <div
                className="modal-content-scroll w-full max-w-2xl max-h-[90vh] flex flex-col overflow-y-auto bg-[#1a1a1a] border border-neutral-800 shadow-2xl relative group"
                onClick={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
            >
                {/* --- Top + Header --- */}
                <div className="sticky top-0 z-20 bg-[#151515] border-b border-neutral-800">
                    <div className="h-6 w-full flex items-center justify-between px-2">
                        <div className="flex gap-2 text-[8px] tracking-[0.2em] text-neutral-500 uppercase font-bold font-orbitron">
                            <span>SYS.ALLACCESS.01</span>
                            <span>///</span>
                            <span>SECURE</span>
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
                    <div className="px-6 pt-4 pb-2 bg-[#151515]">
                        <h2 id="all-access-pass-title" className="text-xl md:text-2xl font-bold text-white font-orbitron tracking-tight mb-2 uppercase">
                            All-Access Pass Registration
                        </h2>
                        <div className="flex items-center gap-3 text-[10px] tracking-widest text-neutral-500 uppercase font-orbitron">
                            <span>Step {step === 'events' ? '01' : '02'}</span>
                            <div className="h-[1px] flex-1 bg-neutral-800"></div>
                            <span>Total Steps: 02</span>
                        </div>
                        <div className="mt-4 mb-2 h-[2px] w-full bg-neutral-800">
                            <div
                                className="h-full bg-neutral-400 transition-all duration-300 relative"
                                style={{
                                    width: step === 'events' ? '50%' : '100%',
                                }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 relative">
                        {/* Corner Accents */}
                        <div className="absolute top-6 right-6 w-3 h-3 border-t border-r border-neutral-600 pointer-events-none" />
                        <div className="absolute bottom-6 left-6 w-3 h-3 border-b border-l border-neutral-600 pointer-events-none" />

                        {/* Step 1: Select Events */}
                        {step === 'events' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-[#151515] border border-neutral-800 flex items-start gap-3">
                                    <div className="w-1 h-full min-h-[2rem] bg-neutral-700" />
                                    <div>
                                        <p className="text-neutral-300 text-sm font-orbitron tracking-wide uppercase mb-1">
                                            Select Events (Unlimited)
                                        </p>
                                        <p className="text-neutral-500 text-xs font-mono">
                                            // Choose events from all 3 days - no limits!
                                        </p>
                                    </div>
                                </div>

                                {loadingEvents ? (
                                    <div className="text-center py-8 text-neutral-500 font-mono text-xs">
                                        LOADING EVENTS...
                                    </div>
                                ) : (
                                    <div className="max-h-[40vh] overflow-y-auto space-y-6 pr-2">
                                        {ALL_DAYS.map((day) => {
                                            const events = eventsByDay[day.id] || [];
                                            if (events.length === 0) return null;

                                            return (
                                                <div key={day.id}>
                                                    <div className="mb-3 flex items-center gap-3">
                                                        <h3 className="text-sm font-orbitron text-white uppercase tracking-wider">
                                                            {day.label}
                                                        </h3>
                                                        <div className="h-[1px] flex-1 bg-neutral-800"></div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {events.map((event) => {
                                                            const isSelected = selectedEventIds.includes(event.id);
                                                            const isConflicting = conflictingEventIds.has(event.id) && !isSelected;
                                                            const isDisabled = isConflicting;

                                                            return (
                                                                <button
                                                                    key={event.id}
                                                                    type="button"
                                                                    disabled={isDisabled}
                                                                    onClick={() => {
                                                                        if (isDisabled) return;
                                                                        setSelectedEventIds(prev =>
                                                                            prev.includes(event.id)
                                                                                ? prev.filter(id => id !== event.id)
                                                                                : [...prev, event.id]
                                                                        );
                                                                    }}
                                                                    className={`w-full p-4 border transition-all duration-300 flex items-start gap-4 group/event relative ${isSelected
                                                                        ? 'border-blue-500 bg-blue-500/10'
                                                                        : isDisabled
                                                                            ? 'border-neutral-800 bg-[#0a0a0a] opacity-40 cursor-not-allowed'
                                                                            : 'border-neutral-800 bg-[#0a0a0a] hover:border-neutral-600'
                                                                        }`}
                                                                >
                                                                    {/* Time Conflict Badge */}
                                                                    {isConflicting && (
                                                                        <div className="absolute top-2 right-2 px-2 py-1 bg-red-900/20 border border-red-900/50">
                                                                            <span className="text-[8px] text-red-400 font-mono uppercase tracking-wider">
                                                                                ⏰ TIME CONFLICT
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 mt-1 ${isSelected
                                                                        ? 'border-blue-500 bg-blue-500/20'
                                                                        : 'border-neutral-600 bg-neutral-900'
                                                                        }`}>
                                                                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isSelected ? 'bg-blue-500' : 'bg-transparent'
                                                                            }`} />
                                                                    </div>
                                                                    <div className="flex-1 text-left">
                                                                        <p className={`font-orbitron text-sm tracking-wide uppercase ${isConflicting ? 'text-neutral-500' : 'text-white'}`}>
                                                                            {event.name}
                                                                        </p>
                                                                        <div className="flex gap-2 mt-1 flex-wrap">
                                                                            <span className="text-[10px] text-neutral-500 font-mono">
                                                                                {event.category === 'technical' ? 'TECH' : 'NON-TECH'}
                                                                            </span>
                                                                            <span className="text-[10px] text-neutral-700">•</span>
                                                                            <span className="text-[10px] text-neutral-500 font-mono">
                                                                                {event.type.toUpperCase()}
                                                                            </span>
                                                                            <span className="text-[10px] text-neutral-700">•</span>
                                                                            <span className="text-[10px] text-neutral-500 font-mono">
                                                                                {event.venue}
                                                                            </span>
                                                                            {(event.startTime || event.endTime) && (
                                                                                <>
                                                                                    <span className="text-[10px] text-neutral-700">•</span>
                                                                                    <span className="text-[10px] text-neutral-500 font-mono">
                                                                                        {event.startTime}{event.endTime ? ` - ${event.endTime}` : ' onwards'}
                                                                                    </span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {selectedEventIds.length > 0 && (
                                    <div className="p-4 bg-[#151515] border border-neutral-700">
                                        <span className="text-xs text-neutral-400 font-mono">
                                            {selectedEventIds.length} event{selectedEventIds.length > 1 ? 's' : ''} selected across all 3 days
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Review & Pay */}
                        {step === 'review' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-orbitron text-white uppercase tracking-wider mb-4">Registration Summary</h3>

                                    <div className="border border-neutral-800 bg-[#0a0a0a] divide-y divide-neutral-800">
                                        <div className="p-3 flex justify-between items-center">
                                            <span className="text-[10px] text-neutral-500 font-orbitron uppercase">User ID</span>
                                            <div className="text-right">
                                                <div className="text-sm text-white font-mono">
                                                    {userData?.name || user?.displayName || user?.email || 'User'}
                                                </div>
                                                <div className="text-[10px] text-neutral-600 font-mono">
                                                    {userData?.phone ?? '-'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] text-neutral-500 font-orbitron uppercase">Pass Type</span>
                                                <span className="text-[10px] text-neutral-400 font-mono">ALL-ACCESS (3 DAYS)</span>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] text-neutral-500 font-orbitron uppercase">Selected Events</span>
                                                <span className="text-[10px] text-neutral-500 font-mono">{selectedEventIds.length} Event{selectedEventIds.length > 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="space-y-1 pl-2 border-l border-neutral-800 max-h-40 overflow-y-auto">
                                                {selectedEventIds.map((eventId) => {
                                                    // Find event in any day
                                                    let event: any = null;
                                                    for (const dayEvents of Object.values(eventsByDay)) {
                                                        event = dayEvents.find((e: any) => e.id === eventId);
                                                        if (event) break;
                                                    }
                                                    return event ? (
                                                        <div key={eventId} className="text-xs font-mono text-neutral-400">
                                                            {event.name}
                                                        </div>
                                                    ) : null;
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
                                                ALL-ACCESS PASS (BEST VALUE)
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-white font-orbitron tracking-tighter">
                                            ₹{ALL_ACCESS_PRICE}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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
                            {step !== 'events' && (
                                <button
                                    type="button"
                                    onClick={goToPrevStep}
                                    disabled={submitting}
                                    className="flex-1 border border-neutral-700 py-3 text-xs font-bold text-neutral-400 font-orbitron uppercase hover:bg-neutral-800 transition disabled:opacity-50 tracking-widest"
                                >
                                    Back
                                </button>
                            )}
                            {step === 'events' && (
                                <button
                                    type="button"
                                    onClick={onCloseAction}
                                    className="flex-1 border border-neutral-700 py-3 text-xs font-bold text-neutral-400 font-orbitron uppercase hover:bg-neutral-800 transition tracking-widest"
                                >
                                    Abort
                                </button>
                            )}
                            {step !== 'review' ? (
                                <button
                                    type="button"
                                    onClick={goToNextStep}
                                    className="flex-1 border border-neutral-700 py-3 text-xs font-bold text-neutral-400 font-orbitron uppercase hover:bg-neutral-800 transition disabled:opacity-50 tracking-widest"
                                >
                                    Proceed
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex-1 border border-neutral-700 py-3 text-xs font-bold text-neutral-400 font-orbitron uppercase hover:bg-neutral-800 transition disabled:opacity-50 tracking-widest"
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
        </div>
    );
}
