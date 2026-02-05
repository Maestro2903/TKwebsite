'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { openCashfreeCheckout } from '@/lib/cashfree';

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

            // Create team document
            const teamId = `team_${Date.now()}_${uid.substring(0, 8)}`;

            // Save team to Firestore
            await setDoc(doc(db, 'teams', teamId), {
                teamId,
                teamName: teamName.trim(),
                leaderId: uid,
                leaderName: name,
                leaderEmail: email,
                leaderPhone: leaderPhone.trim(),
                leaderCollege: leaderCollege.trim(),
                members: members.map((m) => ({
                    name: m.name.trim(),
                    phone: m.phone.trim(),
                    email: m.email.trim(),
                })),
                totalMembers,
                totalAmount,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            // Update user document
            await setDoc(
                doc(db, 'users', uid),
                {
                    uid,
                    name,
                    email,
                    college: leaderCollege.trim(),
                    phone: leaderPhone.trim(),
                    createdAt: serverTimestamp(),
                },
                { merge: true }
            );

            // Create payment order
            const token = await auth.currentUser?.getIdToken();
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
                    teamData: {
                        name,
                        email,
                        phone: leaderPhone.trim(),
                    },
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to create order');
            }

            const data = (await res.json()) as { sessionId?: string };
            const sessionId = data.sessionId;
            if (!sessionId) throw new Error('No payment session');

            onClose();
            await openCashfreeCheckout(sessionId);
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="group-registration-title"
            onClick={(e) => e.target === overlayRef.current && onClose()}
        >
            <div
                className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-white/15 bg-black p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 id="group-registration-title" className="text-xl font-semibold text-white">
                            Group Event Registration
                        </h2>
                        <p className="text-sm text-white/60 mt-1">
                            Step {step === 'leader' ? '1' : step === 'members' ? '2' : '3'} of 3
                        </p>
                    </div>
                    <button
                        type="button"
                        className="text-2xl text-white/70 hover:text-white"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                {/* Progress bar */}
                <div className="mb-6 h-1 w-full rounded-full bg-white/10">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                        style={{
                            width: step === 'leader' ? '33%' : step === 'members' ? '66%' : '100%',
                        }}
                    />
                </div>

                {/* Step 1: Team Leader Info */}
                {step === 'leader' && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10">
                            <p className="text-white/80 text-sm">
                                👋 You are registering as the <strong className="text-white">Team Leader</strong>
                            </p>
                            <p className="text-white/60 text-xs mt-1">
                                Logged in as: {user?.displayName || user?.email}
                            </p>
                        </div>

                        <div>
                            <label htmlFor="team-name" className="mb-1 block text-sm text-white/80">
                                Team Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="team-name"
                                type="text"
                                required
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="e.g., The Innovators"
                                className="w-full rounded border border-white/20 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                            />
                        </div>

                        <div>
                            <label htmlFor="leader-phone" className="mb-1 block text-sm text-white/80">
                                Your Phone <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="leader-phone"
                                type="tel"
                                required
                                value={leaderPhone}
                                onChange={(e) => setLeaderPhone(e.target.value)}
                                placeholder="9876543210"
                                className="w-full rounded border border-white/20 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                            />
                        </div>

                        <div>
                            <label htmlFor="leader-college" className="mb-1 block text-sm text-white/80">
                                Your College <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="leader-college"
                                type="text"
                                required
                                value={leaderCollege}
                                onChange={(e) => setLeaderCollege(e.target.value)}
                                placeholder="Your college name"
                                className="w-full rounded border border-white/20 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Add Team Members */}
                {step === 'members' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-white">Add Team Members</h3>
                                <p className="text-sm text-white/60">
                                    {members.length} member{members.length !== 1 ? 's' : ''} added
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={addMember}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Member
                            </button>
                        </div>

                        {members.length === 0 ? (
                            <div className="p-8 rounded-lg border border-dashed border-white/20 text-center">
                                <p className="text-white/60">No team members added yet</p>
                                <p className="text-sm text-white/40 mt-1">
                                    Click "Add Member" to add team members, or proceed with just yourself
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                                {members.map((member, index) => (
                                    <div
                                        key={member.id}
                                        className="p-4 rounded-lg border border-white/10 bg-white/5 space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white/80">
                                                Member {index + 1}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeMember(member.id)}
                                                className="text-red-400 hover:text-red-300 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="grid gap-3">
                                            <input
                                                type="text"
                                                value={member.name}
                                                onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                                                placeholder="Full Name *"
                                                className="w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:outline-none text-sm"
                                            />
                                            <input
                                                type="tel"
                                                value={member.phone}
                                                onChange={(e) => updateMember(member.id, 'phone', e.target.value)}
                                                placeholder="Phone Number *"
                                                className="w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:outline-none text-sm"
                                            />
                                            <input
                                                type="email"
                                                value={member.email}
                                                onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                                                placeholder="Email ID *"
                                                className="w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Review & Pay */}
                {step === 'review' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Review Your Registration</h3>

                        {/* Team Info */}
                        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                            <h4 className="text-sm font-medium text-white/60 mb-2">TEAM DETAILS</h4>
                            <p className="text-white font-semibold text-lg">{teamName}</p>
                        </div>

                        {/* Team Leader */}
                        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                            <h4 className="text-sm font-medium text-white/60 mb-2">TEAM LEADER</h4>
                            <p className="text-white">{user?.displayName || user?.email}</p>
                            <p className="text-white/60 text-sm">{leaderPhone}</p>
                        </div>

                        {/* Team Members */}
                        {members.length > 0 && (
                            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                                <h4 className="text-sm font-medium text-white/60 mb-2">
                                    TEAM MEMBERS ({members.length})
                                </h4>
                                <div className="space-y-2">
                                    {members.map((m, i) => (
                                        <div key={m.id} className="flex justify-between text-sm">
                                            <span className="text-white">{i + 1}. {m.name}</span>
                                            <span className="text-white/60">{m.phone}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pricing */}
                        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white/80">Price per person</span>
                                <span className="text-white">₹{PRICE_PER_PERSON}</span>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white/80">Total participants</span>
                                <span className="text-white">{totalMembers} (1 leader + {members.length} members)</span>
                            </div>
                            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                                <span className="text-lg font-semibold text-white">Total Amount</span>
                                <span className="text-2xl font-bold text-white">₹{totalAmount}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <p className="mt-4 text-sm text-red-400 p-3 rounded bg-red-500/10 border border-red-500/20" role="alert">
                        {error}
                    </p>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                    {step !== 'leader' && (
                        <button
                            type="button"
                            onClick={goToPrevStep}
                            disabled={submitting}
                            className="flex-1 rounded border border-white/20 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5 transition disabled:opacity-50"
                        >
                            Back
                        </button>
                    )}
                    {step === 'leader' && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded border border-white/20 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5 transition"
                        >
                            Cancel
                        </button>
                    )}
                    {step !== 'review' ? (
                        <button
                            type="button"
                            onClick={goToNextStep}
                            className="flex-1 rounded bg-gradient-to-r from-purple-500 to-pink-500 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 rounded bg-gradient-to-r from-purple-500 to-pink-500 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                        >
                            {submitting ? 'Processing...' : `Pay ₹${totalAmount}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
