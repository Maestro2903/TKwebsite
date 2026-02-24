'use client';

import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { auth } from '@/lib/firebase/clientApp';
import { useAuth } from '@/features/auth/AuthContext';
import { X } from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { getAllConflicts, type EventWithTiming } from '@/lib/utils/eventConflicts';

const MOCK_SUMMIT_EVENT_ID = 'mock-global-summit';

interface CountryItem {
  id: string;
  name: string;
  assignedTo: string | null;
}
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
    const [step, setStep] = useState<'events' | 'invite' | 'country' | 'review'>('events');
    const [mockSummitAccessCode, setMockSummitAccessCode] = useState('');
    const [countries, setCountries] = useState<CountryItem[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [assigningCountryId, setAssigningCountryId] = useState<string | null>(null);
    const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
    const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);

    // Reset form when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setError(null);
        setSelectedEventIds([]);
        setEventsByDay({});
        setMockSummitAccessCode('');
        setCountries([]);
        setSelectedCountryId(null);
        setSelectedCountryName(null);
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

    const hasMockSummitSelected = selectedEventIds.includes(MOCK_SUMMIT_EVENT_ID);
    const stepsForFlow = hasMockSummitSelected ? ['events', 'invite', 'country', 'review'] : ['events', 'review'];
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

    const validateInviteStep = useCallback(() => {
        if (!mockSummitAccessCode.trim()) {
            setError('Access code required for Mock Global Summit.');
            return false;
        }
        setError(null);
        return true;
    }, [mockSummitAccessCode]);

    const validateCountryStep = useCallback(() => {
        if (!selectedCountryId) {
            setError('Please select a country to represent.');
            return false;
        }
        setError(null);
        return true;
    }, [selectedCountryId]);

    // Validate current step
    const validateStep = useCallback(() => {
        if (step === 'events') {
            if (selectedEventIds.length === 0) {
                setError('Please select at least one event');
                return false;
            }
        }
        if (step === 'invite' && !validateInviteStep()) return false;
        if (step === 'country' && !validateCountryStep()) return false;
        setError(null);
        return true;
    }, [step, selectedEventIds, validateInviteStep, validateCountryStep]);

    // Handle step navigation
    const goToNextStep = useCallback(() => {
        if (!validateStep()) return;
        const idx = stepsForFlow.indexOf(step);
        if (idx >= 0 && idx < stepsForFlow.length - 1) setStep(stepsForFlow[idx + 1] as typeof step);
    }, [step, stepsForFlow, validateStep]);

    const goToPrevStep = useCallback(() => {
        const idx = stepsForFlow.indexOf(step);
        if (idx > 0) setStep(stepsForFlow[idx - 1] as typeof step);
    }, [step, stepsForFlow]);

    const handleCountrySelect = useCallback(async (countryId: string) => {
        if (!user?.uid) return;
        setAssigningCountryId(countryId);
        setError(null);
        try {
            const token = await auth.currentUser?.getIdToken(true);
            const res = await fetch('/api/mock-summit/assign-country', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ countryId, inviteCode: mockSummitAccessCode.trim() }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to assign country');
            }
            const country = countries.find(c => c.id === countryId);
            setSelectedCountryId(countryId);
            setSelectedCountryName(country?.name ?? null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign country');
        } finally {
            setAssigningCountryId(null);
        }
    }, [user?.uid, mockSummitAccessCode, countries]);

    const canSubmitRegistration = !hasMockSummitSelected || (mockSummitAccessCode.trim().length > 0 && selectedCountryId != null);

    // Create registration for all-access (no online payment)
    const runRegistration = useCallback(async (countryId?: string) => {
        if (!user || !userData) return;
        const uid = user.uid;
        const email = user.email || user.providerData?.[0]?.email || '';
        const name = userData.name || user.displayName || email || 'Attendee';
        const allDates = ALL_DAYS.map(d => d.date);
        const token = await auth.currentUser?.getIdToken(true);
        if (!token) throw new Error('Not signed in');

        const res = await fetch('/api/registration/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                passType: 'sana_concert',
                selectedDays: allDates,
                selectedEvents: selectedEventIds,
                ...(hasMockSummitSelected && mockSummitAccessCode.trim() && { mockSummitAccessCode: mockSummitAccessCode.trim() }),
                ...(hasMockSummitSelected && countryId && { countryId }),
                teamMemberCount: null,
                teamData: undefined,
                name,
                email: userData.email ?? email,
                phone: userData.phone ?? '',
                college: userData.college ?? '',
            }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to create registration');
        }
        alert('Registration saved. Please pay on spot at the venue to receive your QR pass.');
        onCloseAction();
    }, [user, userData, selectedEventIds, hasMockSummitSelected, mockSummitAccessCode, onCloseAction]);

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
            await runRegistration(selectedCountryId ?? undefined);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    }, [user, userData, hasMockSummitSelected, mockSummitAccessCode, selectedCountryId, runRegistration]);

    if (!isOpen) return null;

    return (
        <div
        ref={overlayRef}
        className="modal-overlay fixed inset-0 z-[2000] flex items-start justify-center pt-[calc(var(--nav-height)+1rem)] bg-black/90 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="all-access-pass-title"
            onClick={(e) => e.target === overlayRef.current && onCloseAction()}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
        >
            <div
                className="modal-content-scroll w-full max-w-2xl max-h-[calc(100dvh-var(--nav-height)-2rem)] min-h-[min(400px,80dvh)] flex flex-col overflow-hidden bg-[#1a1a1a] border border-neutral-800 shadow-2xl relative group rounded-none sm:rounded-xl"
                onClick={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
            >
                {/* --- Top + Header --- */}
                <div className="sticky top-0 z-30 bg-[#151515] border-b border-neutral-800">
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
                                    <label htmlFor="sana-mock-summit-invite" className="block text-[10px] text-neutral-500 font-orbitron uppercase mb-2">
                                        Access code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="sana-mock-summit-invite"
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
                                    disabled={submitting || assigningCountryId != null}
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
                                    disabled={(step === 'country' && !selectedCountryId) || submitting}
                                    className="flex-1 border border-neutral-700 py-3 text-xs font-bold text-neutral-400 font-orbitron uppercase hover:bg-neutral-800 transition disabled:opacity-50 tracking-widest"
                                >
                                    Proceed
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting || !canSubmitRegistration}
                                    className="flex-1 border border-neutral-700 py-3 text-xs font-bold text-neutral-400 font-orbitron uppercase hover:bg-neutral-800 transition disabled:opacity-50 tracking-widest"
                                >
                                    {submitting ? 'SAVING...' : 'SAVE REGISTRATION'}
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
