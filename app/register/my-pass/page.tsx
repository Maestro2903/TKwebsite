'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import { useAuth } from '@/features/auth/AuthContext';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { PASS_TYPES } from '@/types/passes';
import { generateODLetterPDF } from '@/features/passes/odLetterGenerator.client';
import { generateEventPassPDF } from '@/features/passes/eventPassGenerator.client';
import { Download, FileText } from 'lucide-react';
import { NON_TECHNICAL_EVENTS, TECHNICAL_EVENTS } from '@/data/events';

// Build a slug → full-data map from events data
const EVENT_DATA_MAP: Record<string, { id: string; name: string; venue?: string; startTime?: string; endTime?: string }> = {};
[...NON_TECHNICAL_EVENTS, ...TECHNICAL_EVENTS].forEach((e) => {
  EVENT_DATA_MAP[e.id] = {
    id: e.id,
    name: e.name,
    venue: e.venue,
    startTime: e.startTime,
    endTime: e.endTime
  };
});

interface EventAccess {
  tech: boolean;
  nonTech: boolean;
  proshowDays: string[];
  fullAccess: boolean;
}

interface PassDoc {
  id: string;
  userId: string;
  passType: string;
  amount: number;
  status: string;
  qrCode: string;
  createdAt?: { toDate: () => Date };
  selectedDays?: string[];
  selectedEvents?: string[];
  countryId?: string;
  countryName?: string;
  eventAccess?: EventAccess;
  teamSnapshot?: {
    teamName: string;
    totalMembers?: number;
    members: Array<{ name: string; isLeader?: boolean }>;
  };
}

interface UserProfileData {
  name: string;
  college: string;
  phone: string;
  email: string;
}

interface RegistrationDoc {
  id: string;
  passType: string;
  selectedDays: string[];
  selectedEvents: string[];
  calculatedAmount: number;
  status: 'pending' | 'converted' | 'cancelled';
}

const passTypeLabel: Record<string, string> = {
  day_pass: PASS_TYPES.DAY_PASS.name,
  group_events: PASS_TYPES.GROUP_EVENTS.name,
  proshow: PASS_TYPES.PROSHOW.name,
  sana_concert: PASS_TYPES.SANA_CONCERT.name,
  mock_summit: PASS_TYPES.MOCK_SUMMIT.name,
};

export default function MyPassPage() {
  const { user, userData, loading, signIn } = useAuth();
  const [passes, setPasses] = useState<PassDoc[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [downloadingOD, setDownloadingOD] = useState(false);
  const [downloadingEventPass, setDownloadingEventPass] = useState(false);
  const [activePassIndex, setActivePassIndex] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<RegistrationDoc | null>(null);

  // Fetch user profile from appUsers collection
  useEffect(() => {
    if (!user) return;

    // Use AuthContext userData (from appUsers) if already loaded
    if (userData) {
      setUserProfile({
        name: userData.name || user.displayName || 'Unknown',
        college: userData.college || 'N/A',
        phone: userData.phone || '',
        email: userData.email || user.email || '',
      });
      return;
    }

    // Fallback: fetch appUsers directly
    (async () => {
      try {
        const appDoc = await getDoc(doc(db, 'appUsers', user.uid));
        if (appDoc.exists()) {
          const data = appDoc.data();
          setUserProfile({
            name: data.name || user.displayName || 'Unknown',
            college: data.college || 'N/A',
            phone: data.phone || '',
            email: data.email || user.email || '',
          });
        } else {
          setUserProfile({
            name: user.displayName || 'Unknown',
            college: 'N/A',
            phone: '',
            email: user.email || '',
          });
        }
      } catch {
        setUserProfile({
          name: user.displayName || 'Unknown',
          college: 'N/A',
          phone: '',
          email: user.email || '',
        });
      }
    })();
  }, [user, userData]);

  // Fetch passes
  useEffect(() => {
    if (!user) {
      setFetchLoading(false);
      return;
    }
    setFetchLoading(true);
    setFetchError(null);
    let cancelled = false;
    (async () => {
      try {
        // Fetch all passes for user (single where avoids composite index issues)
        const q = query(
          collection(db, 'passes'),
          where('userId', '==', user.uid)
        );
        const snap = await getDocs(q);
        if (cancelled) return;
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as PassDoc))
          .filter((p) => p.status === 'paid')
          .sort((a, b) => {
            const at = a.createdAt?.toDate?.()?.getTime() ?? 0;
            const bt = b.createdAt?.toDate?.()?.getTime() ?? 0;
            return bt - at;
          });
        setPasses(docs);
      } catch (e: any) {
        console.error('Failed to fetch passes', e);
        if (!cancelled) setFetchError(e?.message || 'Failed to load passes');
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/users/registrations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const regs = (data.registrations as any[] | undefined) ?? [];
        const firstPending = regs.find((r) => r.status === 'pending');
        if (firstPending) {
          setPendingRegistration({
            id: firstPending.id,
            passType: firstPending.passType,
            selectedDays: firstPending.selectedDays ?? [],
            selectedEvents: firstPending.selectedEvents ?? [],
            calculatedAmount: firstPending.calculatedAmount ?? 0,
            status: firstPending.status,
          });
        } else {
          setPendingRegistration(null);
        }
      } catch (e) {
        console.error('Failed to fetch registrations', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleDownloadODLetter = async () => {
    if (!pendingRegistration || !userProfile) return;
    setDownloadingOD(true);
    try {
      await generateODLetterPDF({
        userName: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        college: userProfile.college,
        passType: pendingRegistration.passType,
        selectedDays: pendingRegistration.selectedDays,
        selectedEvents: pendingRegistration.selectedEvents.map((slug) => {
          const eventData = EVENT_DATA_MAP[slug];
          if (eventData) return eventData;
          return { id: slug, name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) };
        }),
        calculatedAmount: pendingRegistration.calculatedAmount,
      });
    } catch (error) {
      console.error('Error downloading OD letter:', error);
      alert('Failed to generate OD letter. Please try again.');
    } finally {
      setDownloadingOD(false);
    }
  };

  const handleDownloadEventPass = async (pass: PassDoc) => {
    if (!userProfile) return;
    setDownloadingEventPass(true);
    try {
      await generateEventPassPDF({
        userName: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        college: userProfile.college,
        passType: pass.passType,
        amount: pass.amount,
        qrCode: pass.qrCode,
        selectedDays: pass.selectedDays ?? [],
        selectedEvents: (pass.selectedEvents ?? []).map((slug: string) => {
          const eventData = EVENT_DATA_MAP[slug];
          if (eventData) return eventData;
          return { id: slug, name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) };
        }),
        teamName: pass.teamSnapshot?.teamName,
        members: pass.teamSnapshot?.members,
      });
    } catch (error) {
      console.error('Error downloading event pass:', error);
      alert('Failed to generate event pass. Please try again.');
    } finally {
      setDownloadingEventPass(false);
    }
  };

  if (loading || !user) {
    return (
      <>
        <Navigation />
        <main
          id="main"
          className="page_main min-h-[60vh] flex flex-col items-center justify-center u-container py-16"
        >
          {loading ? (
            <p className="text-white/70">Loading…</p>
          ) : (
            <div className="text-center">
              <p className="mb-6 text-white/80">Sign in to view your pass.</p>
              <button
                type="button"
                onClick={() => signIn()}
                className="rounded bg-white px-6 py-3 font-semibold text-black hover:opacity-90"
              >
                Sign in with Google
              </button>
            </div>
          )}
        </main>
        <Footer />
      </>
    );
  }

  const activePass = passes[activePassIndex] ?? null;

  return (
    <>
      <Navigation />
      <main
        id="main"
        className="page_main u-container py-(--_spacing---section-space--large)"
      >
        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex gap-2 text-[8px] tracking-[0.2em] text-neutral-500 uppercase font-bold font-orbitron">
              <span>SYS.PROFILE</span>
              <span>///</span>
              <span>AUTHENTICATED</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white md:text-3xl font-orbitron tracking-tight uppercase">
            Profile
          </h1>
          <p className="mt-2 text-neutral-500 text-xs font-orbitron tracking-widest uppercase">
            Your registered passes for CIT Takshashila 2026
          </p>
          <div className="mt-4 h-[2px] w-full bg-neutral-800">
            <div className="h-full bg-neutral-400 w-full relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
        </div>

        {fetchLoading ? (
          <p className="text-white/70 font-mono text-sm">Loading your passes…</p>
        ) : fetchError ? (
          <div className="bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-300 font-mono">
            <p className="font-bold text-red-400 mb-1">Error loading passes</p>
            <p>{fetchError}</p>
            <p className="mt-2 text-xs text-red-400/60">UID: {user?.uid ?? 'unknown'}</p>
          </div>
        ) : passes.length === 0 ? (
          pendingRegistration ? (
            <div className="bg-[#1a1a1a] border border-neutral-800 relative overflow-hidden">
              {/* Corner Accents */}
              <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-neutral-600 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-neutral-600 pointer-events-none" />

              {/* Status bar */}
              <div className="h-6 w-full flex items-center px-3 bg-[#151515] border-b border-neutral-800">
                <div className="flex gap-2 text-[7px] tracking-[0.2em] text-amber-500/80 uppercase font-bold font-orbitron">
                  <span>STATUS: PENDING</span>
                  <span>///</span>
                  <span>PAYMENT REQUIRED</span>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-1 h-8 bg-amber-500/60 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-200 font-orbitron tracking-wide uppercase">
                      Pending Registration
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Complete payment on spot at the venue to receive your QR pass.
                    </p>
                  </div>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-[#151515] border border-neutral-800">
                    <p className="text-[10px] text-neutral-500 font-orbitron uppercase tracking-widest mb-1">Pass Type</p>
                    <p className="text-sm text-white font-mono">
                      {passTypeLabel[pendingRegistration.passType] ?? pendingRegistration.passType}
                    </p>
                  </div>
                  <div className="p-4 bg-[#151515] border border-neutral-800">
                    <p className="text-[10px] text-neutral-500 font-orbitron uppercase tracking-widest mb-1">Estimated Amount</p>
                    <p className="text-xl font-bold text-white font-orbitron">
                      ₹{pendingRegistration.calculatedAmount.toFixed(0)}
                    </p>
                  </div>
                  {pendingRegistration.selectedDays.length > 0 && (
                    <div className="p-4 bg-[#151515] border border-neutral-800">
                      <p className="text-[10px] text-neutral-500 font-orbitron uppercase tracking-widest mb-1">Selected Days</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {pendingRegistration.selectedDays.map((day) => (
                          <span key={day} className="px-2 py-1 text-xs font-mono text-neutral-300 border border-neutral-700 bg-neutral-800/50">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {pendingRegistration.selectedEvents.length > 0 && (
                    <div className="p-4 bg-[#151515] border border-neutral-800">
                      <p className="text-[10px] text-neutral-500 font-orbitron uppercase tracking-widest mb-1">Events</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {pendingRegistration.selectedEvents.map((evt) => {
                          const eventData = EVENT_DATA_MAP[evt];
                          const displayName = eventData?.name ?? evt.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
                          return (
                            <span key={evt} className="px-2 py-1 text-xs font-mono text-neutral-300 border border-neutral-700 bg-neutral-800/50">
                              {displayName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Warning Notice */}
                <div className="border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
                  <div className="w-1 h-3 mt-0.5 bg-amber-500/60 shrink-0" />
                  <p className="text-[10px] text-amber-200/80 font-mono uppercase tracking-wide">
                    QR code will be generated only after payment is collected at the venue.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/register"
                    className="flex-1 border border-neutral-700 py-3 px-8 text-xs font-bold text-neutral-400 font-orbitron uppercase hover:bg-neutral-800 transition tracking-widest text-center"
                  >
                    Edit Registration
                  </Link>
                  <button
                    type="button"
                    onClick={handleDownloadODLetter}
                    disabled={downloadingOD}
                    className="flex-1 border border-blue-500/40 bg-blue-500/10 py-3 px-8 text-xs font-bold text-blue-300 font-orbitron uppercase hover:bg-blue-500/20 transition tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingOD ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Generating…</span>
                      </>
                    ) : (
                      <>
                        <FileText size={14} />
                        <span>Download OD Letter</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom strip */}
              <div className="h-4 w-full flex items-center justify-end px-3 border-t border-neutral-800 bg-[#151515] text-[6px] text-neutral-600 font-orbitron uppercase">
                <span>AWAITING ON-SPOT PAYMENT</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#1a1a1a] border border-neutral-800 relative overflow-hidden">
              {/* Corner Accents */}
              <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-neutral-600 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-neutral-600 pointer-events-none" />

              <div className="h-6 w-full flex items-center px-3 bg-[#151515] border-b border-neutral-800">
                <div className="flex gap-2 text-[7px] tracking-[0.2em] text-neutral-500 uppercase font-bold font-orbitron">
                  <span>STATUS: NO PASSES</span>
                </div>
              </div>

              <div className="p-8 text-center flex flex-col items-center gap-4">
                <p className="text-neutral-400 text-sm font-mono">You don&apos;t have any paid passes yet.</p>
                <Link
                  href="/register"
                  className="border border-neutral-700 py-3 px-8 text-xs font-bold text-neutral-400 font-orbitron uppercase hover:bg-neutral-800 transition tracking-widest"
                >
                  Get A Pass
                </Link>
              </div>

              <div className="h-4 w-full flex items-center justify-end px-3 border-t border-neutral-800 bg-[#151515] text-[6px] text-neutral-600 font-orbitron uppercase">
                <span>SECURE CONNECTION ESTABLISHED</span>
              </div>
            </div>
          )
        ) : (
          <>
            {/* Pass tab selector (if multiple passes) */}
            {passes.length > 1 && (
              <div className="mb-8 flex gap-2 flex-wrap">
                {passes.map((pass, i) => (
                  <button
                    key={pass.id}
                    type="button"
                    onClick={() => setActivePassIndex(i)}
                    className={`px-4 py-2 text-xs font-orbitron uppercase tracking-wider border transition-all duration-200 ${i === activePassIndex
                      ? 'bg-white/10 border-green-500/50 text-white'
                      : 'bg-white/5 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
                      }`}
                  >
                    {passTypeLabel[pass.passType] ?? pass.passType}
                  </button>
                ))}
              </div>
            )}

            {activePass && userProfile && (
              <div className="bg-[#1a1a1a] border border-neutral-800 relative overflow-hidden">
                {/* Corner Accents */}
                <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-neutral-600 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-neutral-600 pointer-events-none" />

                {/* Status bar */}
                <div className="h-6 w-full flex items-center px-3 bg-[#151515] border-b border-neutral-800">
                  <div className="flex gap-2 text-[7px] tracking-[0.2em] text-green-500/80 uppercase font-bold font-orbitron">
                    <span>STATUS: VERIFIED</span>
                    <span>///</span>
                    <span>PASS ACTIVE</span>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row">
                  {/* LEFT: Content (~72% width) */}
                  <div className="flex-1 p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-8 bg-green-500/60 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-green-200 font-orbitron tracking-wide uppercase">
                          {passTypeLabel[activePass.passType] ?? activePass.passType}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          Show QR at entry gates for verification.
                        </p>
                      </div>
                    </div>

                    {/* Data Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-[#1a1a1a] border border-neutral-800">
                        <p className="text-[9px] text-neutral-500 font-orbitron uppercase tracking-widest mb-1">Attendee</p>
                        <p className="text-xs text-white font-mono">{userProfile.name}</p>
                      </div>
                      <div className="p-3 bg-[#1a1a1a] border border-neutral-800">
                        <p className="text-[9px] text-neutral-500 font-orbitron uppercase tracking-widest mb-1">Amount Paid</p>
                        <p className="text-base font-bold text-white font-orbitron">
                          ₹{activePass.amount}
                        </p>
                      </div>
                      {(activePass.selectedDays ?? []).length > 0 && (
                        <div className="p-3 bg-[#1a1a1a] border border-neutral-800">
                          <p className="text-[9px] text-neutral-500 font-orbitron uppercase tracking-widest mb-1">Days</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {(activePass.selectedDays ?? []).map((day) => (
                              <span key={day} className="px-1.5 py-0.5 text-[10px] font-mono text-neutral-300 border border-neutral-700 bg-neutral-800/50">
                                {day}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {(activePass.selectedEvents ?? []).length > 0 && (
                        <div className="p-3 bg-[#1a1a1a] border border-neutral-800">
                          <p className="text-[9px] text-neutral-500 font-orbitron uppercase tracking-widest mb-1">Events</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {(activePass.selectedEvents ?? []).map((evt) => {
                              const eventData = EVENT_DATA_MAP[evt];
                              const displayName = eventData?.name ?? evt.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
                              return (
                                <span key={evt} className="px-1.5 py-0.5 text-[10px] font-mono text-neutral-300 border border-neutral-700 bg-neutral-800/50">
                                  {displayName}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {activePass.teamSnapshot && (
                        <div className="p-3 bg-[#1a1a1a] border border-neutral-800 col-span-2">
                          <p className="text-[9px] text-neutral-500 font-orbitron uppercase tracking-widest mb-1">Team: {activePass.teamSnapshot.teamName}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {activePass.teamSnapshot.members.map((m, i) => (
                              <span key={i} className={`px-1.5 py-0.5 text-[10px] font-mono border bg-neutral-800/50 ${m.isLeader ? 'text-amber-300 border-amber-700' : 'text-neutral-300 border-neutral-700'}`}>
                                {m.name}{m.isLeader ? ' ★' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notice */}
                    <div className="border border-green-500/20 bg-green-500/5 p-2.5 flex items-start gap-2">
                      <div className="w-1 h-3 mt-0.5 bg-green-500/60 shrink-0" />
                      <p className="text-[9px] text-green-200/80 font-mono uppercase tracking-wide">
                        This QR code is your entry pass. Screenshot or download for offline access.
                      </p>
                    </div>

                    {/* Download button */}
                    <button
                      type="button"
                      onClick={() => handleDownloadEventPass(activePass)}
                      disabled={downloadingEventPass}
                      className="w-full border border-blue-500/40 bg-blue-500/10 py-2.5 px-6 text-xs font-bold text-blue-300 font-orbitron uppercase hover:bg-blue-500/20 transition tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingEventPass ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Generating…</span>
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          <span>Download Pass</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* RIGHT: QR Code (~28% width) */}
                  {activePass.qrCode && (
                    <div className="sm:w-[28%] shrink-0 flex items-center justify-center p-5 sm:p-4 border-t sm:border-t-0 sm:border-l border-neutral-800 bg-[#151515]">
                      <div className="p-2.5 bg-white rounded">
                        <img
                          src={activePass.qrCode}
                          alt="Entry QR Code"
                          className="w-36 h-36 sm:w-full sm:h-auto aspect-square"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom strip */}
                <div className="h-4 w-full flex items-center justify-end px-3 border-t border-neutral-800 bg-[#151515] text-[6px] text-neutral-600 font-orbitron uppercase">
                  <span>SECURE CONNECTION ESTABLISHED</span>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
