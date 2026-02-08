'use client';

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/clientApp';
import { useAuth } from '@/features/auth/AuthContext';
import { openCashfreeCheckout } from '@/features/payments/cashfreeClient';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';


const PRICE_PER_PERSON = 250;

interface TeamMember {
    id: string;
    name: string;
    phone: string;
    email: string;
}

interface GroupRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GroupRegistrationModal({
    isOpen,
    onClose,
}: GroupRegistrationModalProps) {
    const { user } = useAuth();
    const overlayRef = useRef<HTMLDivElement>(null);

    // Team Leader info
    const [teamName, setTeamName] = useState('');
    const [leaderPhone, setLeaderPhone] = useState('');
    const [leaderCollege, setLeaderCollege] = useState('');

    // Team members (excluding leader)
    const [members, setMembers] = useState<TeamMember[]>([]);

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'leader' | 'members' | 'review'>('leader');

    // Reset form when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setError(null);
        setTeamName('');
        setLeaderPhone('');
        setLeaderCollege('');
        setMembers([]);
        setStep('leader');
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
    const totalMembers = 1 + members.length; // Leader + team members
    const totalAmount = totalMembers * PRICE_PER_PERSON;

    // Add a new empty member
    const addMember = useCallback(() => {
        setMembers((prev) => [
            ...prev,
            { id: `member-${Date.now()}`, name: '', phone: '', email: '' },
        ]);
    }, []);

    // Remove a member
    const removeMember = useCallback((id: string) => {
        setMembers((prev) => prev.filter((m) => m.id !== id));
    }, []);

    // Update a member field
    const updateMember = useCallback(
        (id: string, field: keyof Omit<TeamMember, 'id'>, value: string) => {
            setMembers((prev) =>
                prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
            );
        },
        []
    );

    // Validate current step
    const validateStep = useCallback(() => {
        if (step === 'leader') {
            if (!teamName.trim()) {
                setError('Please enter a team name');
                return false;
            }
            if (!leaderPhone.trim() || leaderPhone.trim().length < 10) {
                setError('Please enter a valid phone number');
                return false;
            }
            if (!leaderCollege.trim()) {
                setError('Please enter your college name');
                return false;
            }
        }
        if (step === 'members') {
            for (const member of members) {
                if (!member.name.trim()) {
                    setError('Please enter name for all team members');
                    return false;
                }
                if (!member.phone.trim() || member.phone.trim().length < 10) {
                    setError('Please enter valid phone number for all team members');
                    return false;
                }
                if (!member.email.trim() || !member.email.includes('@')) {
                    setError('Please enter valid email for all team members');
                    return false;
                }
            }
        }
        setError(null);
        return true;
    }, [step, teamName, leaderPhone, leaderCollege, members]);

    // Handle step navigation
    const goToNextStep = useCallback(() => {
        if (!validateStep()) return;
        if (step === 'leader') setStep('members');
        else if (step === 'members') setStep('review');
    }, [step, validateStep]);

    const goToPrevStep = useCallback(() => {
        if (step === 'members') setStep('leader');
        else if (step === 'review') setStep('members');
    }, [step]);

    // Handle form submission
    const handleSubmit = useCallback(async () => {
        if (!user) return;
        setError(null);
        setSubmitting(true);

        try {
            const uid = user.uid;
            const email = user.email || user.providerData?.[0]?.email || '';
            const name = user.displayName || email || 'Team Leader';

            // Team ID generated here but document created by server
            const teamId = `team_${Date.now()}_${uid.substring(0, 8)}`;

            // Update user document (allowed by rules)
            await setDoc(
                doc(db, 'users', uid),
                {
                    uid,
                    name,
                    email,
                    college: leaderCollege.trim(),
                    phone: leaderPhone.trim(),
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            // Create payment order and team document via server
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
                    passType: 'group_events',
                    amount: totalAmount,
                    teamMemberCount: totalMembers,
                    teamId,
                    teamName: teamName.trim() || name,
                    members: members.map(m => ({
                        name: m.name,
                        phone: m.phone,
                        email: m.email
                    })),
                    teamData: {
                        name,
                        email,
                        phone: leaderPhone.trim(),
                        college: leaderCollege.trim(),
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
    }, [user, teamName, leaderPhone, leaderCollege, members, totalMembers, totalAmount, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="group-registration-title"
            onClick={(e) => e.target === overlayRef.current && onClose()}
        >
            <div
                className="w-full max-w-lg max-h-[90vh] overflow-y-auto overscroll-contain bg-[#1a1a1a] border border-neutral-800 shadow-2xl relative group"
                onClick={(e) => e.stopPropagation()}
            >
                {/* --- Top Tech Border --- */}
                <div className="h-6 w-full flex items-center justify-between px-2 border-b border-neutral-800 bg-[#151515] sticky top-0 z-20">
                    <div className="flex gap-2 text-[8px] tracking-[0.2em] text-neutral-500 uppercase font-bold font-orbitron">
                        <span>SYS.REG.01</span>
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
                        <h2 id="group-registration-title" className="text-xl md:text-2xl font-bold text-white font-orbitron tracking-tight mb-2 uppercase">
                            Group Registration
                        </h2>
                        <div className="flex items-center gap-3 text-[10px] tracking-widest text-neutral-500 uppercase font-orbitron">
                            <span>Step {step === 'leader' ? '01' : step === 'members' ? '02' : '03'}</span>
                            <div className="h-[1px] flex-1 bg-neutral-800"></div>
                            <span>Total Steps: 03</span>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-8 h-[2px] w-full bg-neutral-800">
                        <div
                            className="h-full bg-neutral-400 transition-all duration-300 relative"
                            style={{
                                width: step === 'leader' ? '33%' : step === 'members' ? '66%' : '100%',
                            }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        </div>
                    </div>

                    {/* Step 1: Team Leader Info */}
                    {step === 'leader' && (
                        <div className="space-y-6">
                            <div className="p-4 bg-[#151515] border border-neutral-800 flex items-start gap-3">
                                <div className="w-1 h-full min-h-[2rem] bg-neutral-700" />
                                <div>
                                    <p className="text-neutral-300 text-sm font-orbitron tracking-wide uppercase mb-1">
                                        Team Leader Identity
                                    </p>
                                    <p className="text-neutral-500 text-xs font-mono">
                                        // {user?.displayName || user?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="group/input">
                                    <label htmlFor="team-name" className="mb-2 block text-xs text-neutral-500 font-orbitron tracking-widest uppercase">
                                        Team Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="team-name"
                                        type="text"
                                        required
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        placeholder="ENTER TEAM DESIGNATION"
                                        className="w-full bg-[#0a0a0a] border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-700 text-sm font-mono focus:border-neutral-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div className="group/input">
                                    <label htmlFor="leader-phone" className="mb-2 block text-xs text-neutral-500 font-orbitron tracking-widest uppercase">
                                        Comms Frequency (Phone) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="leader-phone"
                                        type="tel"
                                        required
                                        value={leaderPhone}
                                        onChange={(e) => setLeaderPhone(e.target.value)}
                                        placeholder="0000000000"
                                        className="w-full bg-[#0a0a0a] border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-700 text-sm font-mono focus:border-neutral-500 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div className="group/input">
                                    <label htmlFor="leader-college" className="mb-2 block text-xs text-neutral-500 font-orbitron tracking-widest uppercase">
                                        Affiliation (College) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="leader-college"
                                        type="text"
                                        required
                                        value={leaderCollege}
                                        onChange={(e) => setLeaderCollege(e.target.value)}
                                        placeholder="INSTITUTE NAME"
                                        className="w-full bg-[#0a0a0a] border border-neutral-800 px-4 py-3 text-white placeholder:text-neutral-700 text-sm font-mono focus:border-neutral-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Add Team Members */}
                    {step === 'members' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                                <div>
                                    <h3 className="text-sm font-orbitron text-white uppercase tracking-wider">Unit Members</h3>
                                    <p className="text-[10px] text-neutral-500 font-mono mt-1">
                                        COUNT: {members.length} // MAX: UNLIMITED
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addMember}
                                    className="px-3 py-1.5 border border-neutral-700 bg-neutral-800/50 text-neutral-300 text-xs font-orbitron hover:bg-neutral-700 transition flex items-center gap-2"
                                >
                                    <span>+</span> ADD UNIT
                                </button>
                            </div>

                            {members.length === 0 ? (
                                <div className="py-12 border border-dashed border-neutral-800 bg-[#0a0a0a] text-center flex flex-col items-center justify-center">
                                    <div className="w-8 h-8 mb-3 opacity-20 border border-white rounded-full flex items-center justify-center">
                                        <span className="text-xl">+</span>
                                    </div>
                                    <p className="text-neutral-500 text-xs font-mono uppercase">No units assigned</p>
                                    <p className="text-neutral-700 text-[10px] mt-1 font-mono">
                                        Initialize additional members or proceed solo
                                    </p>
                                </div>
                            ) : (
                                <ScrollArea className="h-[40vh] w-full border border-neutral-800 bg-[#0a0a0a]">
                                    <div className="p-4 space-y-4">
                                        {members.map((member, index) => (
                                            <div key={member.id} className="p-4 border border-neutral-800 bg-[#151515] relative group/item">
                                                <div className="absolute top-0 left-0 w-[2px] h-full bg-neutral-800 group-hover/item:bg-neutral-600 transition-colors" />

                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[10px] font-orbitron text-neutral-500 uppercase tracking-widest">
                                                        Unit 0{index + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMember(member.id)}
                                                        className="text-neutral-600 hover:text-red-400 transition-colors"
                                                        aria-label="Remove member"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>

                                                <div className="grid gap-2">
                                                    <input
                                                        type="text"
                                                        value={member.name}
                                                        onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                                                        placeholder="FULL NAME"
                                                        className="w-full bg-transparent border-b border-neutral-800 py-1 text-white placeholder:text-neutral-700 text-sm font-mono focus:border-neutral-500 focus:outline-none transition-colors"
                                                    />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <input
                                                            type="tel"
                                                            value={member.phone}
                                                            onChange={(e) => updateMember(member.id, 'phone', e.target.value)}
                                                            placeholder="PHONE"
                                                            className="w-full bg-transparent border-b border-neutral-800 py-1 text-white placeholder:text-neutral-700 text-sm font-mono focus:border-neutral-500 focus:outline-none transition-colors"
                                                        />
                                                        <input
                                                            type="email"
                                                            value={member.email}
                                                            onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                                                            placeholder="EMAIL"
                                                            className="w-full bg-transparent border-b border-neutral-800 py-1 text-white placeholder:text-neutral-700 text-sm font-mono focus:border-neutral-500 focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                    )}

                    {/* Step 3: Review & Pay */}
                    {step === 'review' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-orbitron text-white uppercase tracking-wider mb-4">Registration Summary</h3>

                                <div className="border border-neutral-800 bg-[#0a0a0a] divide-y divide-neutral-800">
                                    <div className="p-3 flex justify-between items-center">
                                        <span className="text-[10px] text-neutral-500 font-orbitron uppercase">Team Designation</span>
                                        <span className="text-sm text-white font-mono">{teamName}</span>
                                    </div>
                                    <div className="p-3 flex justify-between items-center">
                                        <span className="text-[10px] text-neutral-500 font-orbitron uppercase">Leader ID</span>
                                        <div className="text-right">
                                            <div className="text-sm text-white font-mono">{user?.displayName || user?.email}</div>
                                            <div className="text-[10px] text-neutral-600 font-mono">{leaderPhone}</div>
                                        </div>
                                    </div>
                                    {members.length > 0 && (
                                        <div className="p-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] text-neutral-500 font-orbitron uppercase">Additional Units</span>
                                                <span className="text-[10px] text-neutral-500 font-mono">{members.length} Count</span>
                                            </div>
                                            <div className="space-y-1 pl-2 border-l border-neutral-800">
                                                {members.map((m, i) => (
                                                    <div key={m.id} className="flex justify-between text-xs font-mono">
                                                        <span className="text-neutral-400">{i + 1}. {m.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
                                            {totalMembers} PAX × ₹{PRICE_PER_PERSON}
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
                        {step !== 'leader' && (
                            <button
                                type="button"
                                onClick={goToPrevStep}
                                disabled={submitting}
                                className="flex-1 border border-neutral-700 py-3 text-xs font-bold text-neutral-400 font-orbitron uppercase hover:bg-neutral-800 transition disabled:opacity-50 tracking-widest"
                            >
                                Back
                            </button>
                        )}
                        {step === 'leader' && (
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
