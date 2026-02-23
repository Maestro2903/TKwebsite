'use client';

import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { auth } from '@/lib/firebase/clientApp';
import { useAuth } from '@/features/auth/AuthContext';
import { openCashfreeCheckout } from '@/features/payments/cashfreeClient';
import { X } from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { getAllConflicts, type EventWithTiming } from '@/lib/utils/eventConflicts';

const MOCK_SUMMIT_EVENT_ID = 'mock-global-summit';

interface CountryItem {
  id: string;
  name: string;
  assignedTo: string | null;
}
const MOCK_SUMMIT_DATE = '2026-02-27';

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
    onCloseAction: () => void;
    passType?: string;
    price?: number;
}

export default function DayPassModal({
    isOpen,
    onCloseAction,
    passType = 'day_pass',
    price = 500,
}: DayPassModalProps) {
    const { user, userData } = useAuth();
    const overlayRef = useRef<HTMLDivElement>(null);

    // Selected days
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    // Events
    const [availableEvents, setAvailableEvents] = useState<any[]>([]);
    const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'days' | 'events' | 'invite' | 'country' | 'review'>('days');
    const [mockSummitAccessCode, setMockSummitAccessCode] = useState('');
    const [countries, setCountries] = useState<CountryItem[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [assigningCountryId, setAssigningCountryId] = useState<string | null>(null);
    const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
    const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);

    // const pricePerDay = 500; // Removed hardcoded price

    // Lock global body scroll (and Lenis) when modal is open
    useLockBodyScroll(isOpen);

    // Calculate conflicting events based on current selection
    const conflictingEventIds = useMemo(() => {
        if (selectedEventIds.length === 0 || availableEvents.length === 0) {
            return new Set<string>();
        }

        const selectedEvents = availableEvents.filter(e =>
            selectedEventIds.includes(e.id)
        ) as EventWithTiming[];

        return getAllConflicts(selectedEvents, availableEvents as EventWithTiming[]);
    }, [selectedEventIds, availableEvents]);

    // Reset form when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setError(null);
        setSelectedDays([]);
        setSelectedEventIds([]);
        setAvailableEvents([]);
        setMockSummitAccessCode('');
        setCountries([]);
        setSelectedCountryId(null);
        setSelectedCountryName(null);
        setStep('days');
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

    // Fetch events when days are selected
    useEffect(() => {
        if (selectedDays.length === 0 || !isOpen) {
            setAvailableEvents([]);
            return;
        }

        const fetchEvents = async () => {
            setLoadingEvents(true);
            setError(null);
            try {
                // Get selected dates
                const dates = selectedDays
                    .map(dayId => DAY_OPTIONS.find(d => d.id === dayId)?.date)
                    .filter(Boolean);

                // Fetch events for all selected days
                const eventPromises = dates.map(date =>
                    fetch(`/api/events?date=${date}&passType=${passType}`)
                        .then(r => r.json())
                );

                const results = await Promise.all(eventPromises);
                const allEvents = results.flatMap(r => r.events || []);

                setAvailableEvents(allEvents);
            } catch (err) {
                console.error('Failed to fetch events:', err);
                setError('Failed to load events. Please try again.');
            } finally {
                setLoadingEvents(false);
            }
        };

        fetchEvents();
    }, [selectedDays, isOpen]);

    // Calculate total
    const totalDays = selectedDays.length;
    const totalAmount = totalDays * price;

    const hasMockSummitSelected = selectedEventIds.includes(MOCK_SUMMIT_EVENT_ID);
    const canInitiatePayment = !hasMockSummitSelected || (mockSummitAccessCode.trim().length > 0 && selectedCountryId != null);

    const stepsForFlow = hasMockSummitSelected ? ['days', 'events', 'invite', 'country', 'review'] : ['days', 'events', 'review'];
    const currentStepIndex = stepsForFlow.indexOf(step);
    const totalSteps = stepsForFlow.length;
    const progressWidth = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

    const fetchCountries = useCallback(async () => {
        setLoadingCountries(true);
        setError(null);
        try {
            const res = await fetch('/api/mock-summit/countries');
            if (!res.ok) throw new Error('Failed to load countries');
            const data = await res.json();
            setCountries(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load countries');
            setCountries([]);
        } finally {
            setLoadingCountries(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen && step === 'country') fetchCountries();
    }, [isOpen, step, fetchCountries]);

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
        if (step === 'events') {
            if (selectedEventIds.length === 0) {
                setError('Please select at least one event');
                return false;
            }
        }
        setError(null);
        return true;
    }, [step, selectedDays, selectedEventIds]);

    const validateInviteStep = useCallback(() => {
        if (step !== 'invite') return true;
        if (!mockSummitAccessCode.trim()) {
            setError('Please enter your Mock Global Summit access code.');
            return false;
        }
        setError(null);
        return true;
    }, [step, mockSummitAccessCode]);

    const validateCountryStep = useCallback(() => {
        if (step !== 'country') return true;
        if (!selectedCountryId) {
            setError('Please select a country to represent.');
            return false;
        }
        setError(null);
        return true;
    }, [step, selectedCountryId]);

    const goToNextStep = useCallback(() => {
        if (step === 'invite' && !validateInviteStep()) return;
        if (step === 'country' && !validateCountryStep()) return;
        if (step !== 'invite' && step !== 'country' && !validateStep()) return;
        if (step === 'days') setStep('events');
        else if (step === 'events') setStep(hasMockSummitSelected ? 'invite' : 'review');
        else if (step === 'invite') setStep('country');
        else if (step === 'country') setStep('review');
    }, [step, hasMockSummitSelected, validateStep, validateInviteStep, validateCountryStep]);

    const goToPrevStep = useCallback(() => {
        if (step === 'events') setStep('days');
        else if (step === 'invite') setStep('events');
        else if (step === 'country') setStep('invite');
        else if (step === 'review') setStep(hasMockSummitSelected ? 'country' : 'events');
    }, [step, hasMockSummitSelected]);

    // Run payment (create-order + Cashfree). When Mock Summit is selected, countryId must be passed.
    const runPayment = useCallback(async (countryId?: string) => {
        if (!user || !userData) return;
        const uid = user.uid;
        const email = user.email || user.providerData?.[0]?.email || '';
        const name = userData.name || user.displayName || email || 'Attendee';
        const selectedDates = selectedDays.map(
            (dayId) => DAY_OPTIONS.find((d) => d.id === dayId)?.date
        ).filter(Boolean);

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
                passType: passType,
                amount: totalAmount,
                selectedDays: selectedDates,
                selectedEvents: selectedEventIds,
                ...(hasMockSummitSelected && mockSummitAccessCode.trim() && { mockSummitAccessCode: mockSummitAccessCode.trim() }),
                ...(hasMockSummitSelected && countryId && { countryId }),
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
            window.location.href = `/payment/callback?order_id=${orderId}`;
        } else {
            throw new Error(result.message || 'Payment failed');
        }
    }, [user, userData, selectedDays, totalAmount, selectedEventIds, hasMockSummitSelected, mockSummitAccessCode, onCloseAction]);

    const handleCountrySelect = useCallback(async (countryId: string) => {
        if (!user?.uid) return;
        const country = countries.find((c) => c.id === countryId);
        if (!country) return;
        if (country.assignedTo != null && country.assignedTo !== user.uid) return;
        setAssigningCountryId(countryId);
        setError(null);
        try {
            const token = await auth.currentUser?.getIdToken(true);
            if (!token) throw new Error('Not signed in');
            const res = await fetch('/api/mock-summit/assign-country', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ countryId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Failed to assign country');
            setSelectedCountryId(countryId);
            setSelectedCountryName(data.countryName ?? country.name);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setAssigningCountryId(null);
        }
    }, [user, countries]);

    const handleSubmit = useCallback(async () => {
        if (!user) return;
        if (!userData) {
            setError('Profile incomplete. Please complete your profile first.');
            return;
        }
        if (hasMockSummitSelected && !mockSummitAccessCode.trim()) {
            setError('Access code required for Mock Global Summit.');
            return;
        }
        if (hasMockSummitSelected && !selectedCountryId) {
            setError('Please select a country to represent.');
            return;
        }
        setError(null);
        setSubmitting(true);
        try {
            await runPayment(selectedCountryId ?? undefined);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    }, [user, userData, hasMockSummitSelected, mockSummitAccessCode, selectedCountryId, runPayment]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="modal-overlay fixed inset-0 z-[2000] flex items-start justify-center pt-[calc(var(--nav-height)+1rem)] bg-black/90 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-pass-title"
            onClick={(e) => e.target === overlayRef.current && onCloseAction()}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
        >
            <div
                className="modal-content-scroll w-full max-w-lg max-h-[calc(100dvh-var(--nav-height)-2rem)] min-h-[min(400px,80dvh)] flex flex-col overflow-hidden bg-[#1a1a1a] border border-neutral-800 shadow-2xl relative group rounded-none sm:rounded-xl"
                onClick={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
            >
                {/* --- Top + Header --- */}
                <div className="sticky top-0 z-30 bg-[#151515] border-b border-neutral-800">
                    <div className="h-6 w-full flex items-center justify-between px-2">
                        <div className="flex gap-2 text-[8px] tracking-[0.2em] text-neutral-500 uppercase font-bold font-orbitron">
                            <span>SYS.DAY.01</span>
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
                        <h2 id="day-pass-title" className="text-xl md:text-2xl font-bold text-white font-orbitron tracking-tight mb-2 uppercase">
                            Day Pass Registration
                        </h2>
                        <div className="flex items-center gap-3 text-[10px] tracking-widest text-neutral-500 uppercase font-orbitron">
                            <span>Step {String(currentStepIndex + 1).padStart(2, '0')}</span>
                            <div className="h-[1px] flex-1 bg-neutral-800"></div>
                            <span>Total Steps: {String(totalSteps).padStart(2, '0')}</span>
                        </div>
                        <div className="mt-4 mb-2 h-[2px] w-full bg-neutral-800">
                            <div
                                className="h-full bg-neutral-400 transition-all duration-300 relative"
                                style={{ width: `${progressWidth}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <div className="p-6 relative min-h-[200px]">
                        {/* Corner Accents */}
                        <div className="absolute top-6 right-6 w-3 h-3 border-t border-r border-neutral-600 pointer-events-none" />
                        <div className="absolute bottom-6 left-6 w-3 h-3 border-b border-l border-neutral-600 pointer-events-none" />

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
                                                ₹{price}
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

                        {/* Step 2: Select Events */}
                        {step === 'events' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-[#151515] border border-neutral-800 flex items-start gap-3">
                                    <div className="w-1 h-full min-h-[2rem] bg-neutral-700" />
                                    <div>
                                        <p className="text-neutral-300 text-sm font-orbitron tracking-wide uppercase mb-1">
                                            Select Events
                                        </p>
                                        <p className="text-neutral-500 text-xs font-mono">
                                            // Choose events for selected days
                                        </p>
                                    </div>
                                </div>

                                {loadingEvents ? (
                                    <div className="text-center py-8 text-neutral-500 font-mono text-xs">
                                        LOADING EVENTS...
                                    </div>
                                ) : availableEvents.length === 0 ? (
                                    <div className="text-center py-8 text-neutral-500 font-mono text-xs">
                                        No events available for selected days
                                    </div>
                                ) : (
                                    <div className="max-h-[40vh] overflow-y-auto space-y-3 pr-2">
                                        {availableEvents.map((event) => {
                                            const isMockSummit = event.id === MOCK_SUMMIT_EVENT_ID;
                                            const isMockSummitDate = event.date === MOCK_SUMMIT_DATE;
                                            const mockSummitSelected = selectedEventIds.includes(MOCK_SUMMIT_EVENT_ID);
                                            const isSelected = selectedEventIds.includes(event.id);

                                            // Check if this event conflicts with selected events
                                            const isConflicting = conflictingEventIds.has(event.id) && !isSelected;

                                            // Combine all disabled conditions
                                            const isDisabled = isConflicting || (isMockSummitDate && !isMockSummit && mockSummitSelected);
                                            return (
                                                <button
                                                    key={event.id}
                                                    type="button"
                                                    disabled={isDisabled}
                                                    onClick={() => {
                                                        if (isDisabled) return;
                                                        if (isMockSummit) {
                                                            setSelectedEventIds(prev =>
                                                                prev.includes(event.id)
                                                                    ? prev.filter(id => id !== event.id)
                                                                    : [...prev.filter(id => {
                                                                        const ev = availableEvents.find(e => e.id === id);
                                                                        return ev?.date !== MOCK_SUMMIT_DATE;
                                                                    }), event.id]
                                                            );
                                                        } else if (mockSummitSelected && isMockSummitDate) {
                                                            return;
                                                        } else {
                                                            setSelectedEventIds(prev =>
                                                                prev.includes(event.id)
                                                                    ? prev.filter(id => id !== event.id)
                                                                    : [...prev, event.id]
                                                            );
                                                        }
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

                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 mt-1 ${selectedEventIds.includes(event.id)
                                                        ? 'border-blue-500 bg-blue-500/20'
                                                        : 'border-neutral-600 bg-neutral-900'
                                                        }`}>
                                                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${selectedEventIds.includes(event.id) ? 'bg-blue-500' : 'bg-transparent'
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
                                                            {/* Show timing if available */}
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
                                )}

                                {selectedEventIds.length > 0 && (
                                    <div className="p-4 bg-[#151515] border border-neutral-700">
                                        <span className="text-xs text-neutral-400 font-mono">
                                            {selectedEventIds.length} event{selectedEventIds.length > 1 ? 's' : ''} selected
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step: Invite code (Mock Summit only) */}
                        {step === 'invite' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-[#151515] border border-neutral-800 flex items-start gap-3">
                                    <div className="w-1 h-full min-h-[2rem] bg-neutral-700" />
                                    <div>
                                        <p className="text-neutral-300 text-sm font-orbitron tracking-wide uppercase mb-1">
                                            Mock Global Summit — Access Code
                                        </p>
                                        <p className="text-neutral-500 text-xs font-mono">
                                            // Enter the invite code you received for this event
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="mock-summit-invite" className="block text-[10px] text-neutral-500 font-orbitron uppercase mb-2">
                                        Access code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="mock-summit-invite"
                                        type="text"
                                        value={mockSummitAccessCode}
                                        onChange={(e) => setMockSummitAccessCode(e.target.value)}
                                        placeholder="Enter invite code"
                                        className="w-full bg-[#0a0a0a] border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-700 text-sm font-mono focus:border-neutral-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step: Select country (Mock Summit only) */}
                        {step === 'country' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-[#151515] border border-neutral-800 flex items-start gap-3">
                                    <div className="w-1 h-full min-h-[2rem] bg-neutral-700" />
                                    <div>
                                        <p className="text-neutral-300 text-sm font-orbitron tracking-wide uppercase mb-1">
                                            Choose Country
                                        </p>
                                        <p className="text-neutral-500 text-xs font-mono">
                                            // Select the country you will represent at the summit
                                        </p>
                                    </div>
                                </div>
                                {loadingCountries ? (
                                    <div className="text-center py-12 text-neutral-500 font-mono text-xs">
                                        LOADING COUNTRIES...
                                    </div>
                                ) : countries.length === 0 ? (
                                    <div className="py-8 text-center text-neutral-500 text-xs font-mono">
                                        No countries available. Try again later.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[40vh] overflow-y-auto pr-2">
                                        {countries.map((c) => {
                                            const isTaken = c.assignedTo != null && c.assignedTo !== user?.uid;
                                            const isAssigning = assigningCountryId === c.id;
                                            const isSelected = selectedCountryId === c.id;
                                            const isDisabled = isTaken;
                                            return (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    disabled={isDisabled}
                                                    onClick={() => !isDisabled && handleCountrySelect(c.id)}
                                                    className={`
                                                        relative px-4 py-3 rounded-lg text-left transition-all duration-300
                                                        ${isDisabled ? 'opacity-30 cursor-not-allowed bg-[#0a0a0a] border border-neutral-800 text-neutral-500' : isSelected ? 'border-blue-500 bg-blue-500/10 text-white' : 'bg-[#0a0a0a] border border-neutral-700 text-white hover:border-neutral-600 hover:-translate-y-0.5'}
                                                    `}
                                                >
                                                    {isAssigning ? (
                                                        <span className="inline-flex items-center gap-2">
                                                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                            Assigning…
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <span className="font-medium text-sm">{c.name}</span>
                                                            {isSelected && (
                                                                <span className="absolute top-2 right-2 text-[10px] text-emerald-400 uppercase tracking-wider">Selected</span>
                                                            )}
                                                            {isTaken && !isSelected && (
                                                                <span className="absolute top-2 right-2 text-[10px] text-neutral-500 uppercase">Taken</span>
                                                            )}
                                                        </>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                {selectedCountryId && (
                                    <p className="text-[10px] text-neutral-500 font-mono">
                                        Country selected. Click Proceed to continue.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Step: Review & Pay */}
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
                                                <span className="text-[10px] text-neutral-500 font-orbitron uppercase">Selected Days</span>
                                                <span className="text-[10px] text-neutral-500 font-mono">{selectedDays.length} Day{selectedDays.length > 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="space-y-1 pl-2 border-l border-neutral-800">
                                                {selectedDays.map((dayId) => {
                                                    const day = DAY_OPTIONS.find((d) => d.id === dayId);
                                                    return (
                                                        <div key={dayId} className="flex justify-between text-xs font-mono">
                                                            <span className="text-neutral-400">{day?.label}</span>
                                                            <span className="text-neutral-500">₹{price}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {hasMockSummitSelected && selectedCountryName && (
                                    <div className="p-3 bg-[#151515] border border-neutral-800">
                                        <span className="text-[10px] text-neutral-500 font-orbitron uppercase">Country </span>
                                        <span className="text-xs font-mono text-neutral-300 ml-2">{selectedCountryName}</span>
                                    </div>
                                )}

                                {/* Pricing Display */}
                                <div className="p-4 bg-[#151515] border border-neutral-700 relative overflow-hidden">
                                    {/* Diagonal lines bg */}
                                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 10px)' }}></div>

                                    <div className="relative z-10 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-neutral-500 font-orbitron uppercase mb-1">Total Assessment</p>
                                            <div className="text-xs text-neutral-400 font-mono">
                                                {totalDays} DAY{totalDays > 1 ? 'S' : ''} × ₹{price}
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-white font-orbitron tracking-tighter">
                                            ₹{totalAmount}
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
                            {step !== 'days' && (
                                <button
                                    type="button"
                                    onClick={goToPrevStep}
                                    disabled={submitting || assigningCountryId != null}
                                    className="flex-1 border border-neutral-700 py-3 text-xs font-bold text-neutral-400 font-orbitron uppercase hover:bg-neutral-800 transition disabled:opacity-50 tracking-widest"
                                >
                                    Back
                                </button>
                            )}
                            {step === 'days' && (
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
                                    disabled={(step === 'country' && !selectedCountryId) || submitting}
                                    className="flex-1 border border-neutral-700 py-3 text-xs font-bold text-neutral-400 font-orbitron uppercase hover:bg-neutral-800 transition disabled:opacity-50 tracking-widest"
                                >
                                    Proceed
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting || !canInitiatePayment}
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
