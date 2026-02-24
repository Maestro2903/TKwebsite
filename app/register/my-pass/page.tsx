'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import { useAuth } from '@/features/auth/AuthContext';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { PASS_TYPES } from '@/types/passes';
import { generatePassPDF } from '@/features/passes/pdfGenerator.client';
import PassDetailsCard from '@/components/ui/PassDetailsCard';
import { Download } from 'lucide-react';
import dynamic from 'next/dynamic';
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

// Dynamic import for the 3D Lanyard (needs WebGL, can't SSR)
const Lanyard = dynamic(() => import('@/components/ui/Lanyard'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center">
      <p className="text-white/40 text-sm">Loading 3D badge…</p>
    </div>
  ),
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
  const [downloadingPassId, setDownloadingPassId] = useState<string | null>(null);
  const [activePassIndex, setActivePassIndex] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<RegistrationDoc | null>(null);

  // Fetch user profile from Firestore
  useEffect(() => {
    if (!user) return;

    // Use userData from AuthContext if available
    if (userData) {
      setUserProfile({
        name: userData.name || user.displayName || 'Unknown',
        college: userData.college || 'N/A',
        phone: userData.phone || '',
        email: userData.email || user.email || '',
      });
      return;
    }

    // Fallback: fetch from Firestore directly
    (async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
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
    let cancelled = false;
    (async () => {
      try {
        const q = query(
          collection(db, 'passes'),
          where('userId', '==', user.uid),
          where('status', '==', 'paid')
        );
        const snap = await getDocs(q);
        if (cancelled) return;
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as PassDoc))
          .sort((a, b) => {
            const at = a.createdAt?.toDate?.()?.getTime() ?? 0;
            const bt = b.createdAt?.toDate?.()?.getTime() ?? 0;
            return bt - at;
          });
        setPasses(docs);
      } catch (e) {
        console.error('Failed to fetch passes', e);
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

  const handleDownloadPDF = async (pass: PassDoc) => {
    if (!user) return;

    setDownloadingPassId(pass.id);
    try {
      await generatePassPDF({
        userId: user.uid,
        passType: pass.passType,
        amount: pass.amount,
        qrCode: pass.qrCode,
        teamName: pass.teamSnapshot?.teamName,
        members: pass.teamSnapshot?.members,
        selectedEvents: (pass.selectedEvents ?? []).map((slug: string) => {
          const eventData = EVENT_DATA_MAP[slug];
          if (eventData) return eventData;
          return {
            id: slug,
            name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
          };
        }),
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPassId(null);
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

                {/* Action button */}
                <div className="flex gap-3">
                  <Link
                    href="/register"
                    className="flex-1 sm:flex-none border border-neutral-700 py-3 px-8 text-xs font-bold text-neutral-400 font-orbitron uppercase hover:bg-neutral-800 transition tracking-widest text-center"
                  >
                    Edit Registration
                  </Link>
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
                    className={`px-4 py-2 rounded-lg text-xs font-orbitron uppercase tracking-wider border transition-all duration-200 ${i === activePassIndex
                      ? 'bg-white/10 border-blue-500/50 text-white shadow-lg shadow-blue-500/10'
                      : 'bg-white/5 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
                      }`}
                  >
                    {passTypeLabel[pass.passType] ?? pass.passType}
                  </button>
                ))}
              </div>
            )}

            {/* Main layout: Details Card (left) + Lanyard Badge (right) */}
            {activePass && userProfile && (
              <div className="flex flex-col lg:flex-row gap-10 items-start lg:justify-center lg:pl-16">
                {/* Left: Details card */}
                <div className="w-full lg:max-w-lg">
                  <PassDetailsCard
                    passType={passTypeLabel[activePass.passType] ?? activePass.passType}
                    amount={activePass.amount}
                    status={activePass.status}
                    countryName={activePass.countryName ?? null}
                    purchaseDate={
                      activePass.createdAt?.toDate
                        ? activePass.createdAt.toDate().toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                        : null
                    }
                    selectedDays={activePass.selectedDays ?? []}
                    selectedEvents={(activePass.selectedEvents ?? []).map((slug: string) => {
                      const eventData = EVENT_DATA_MAP[slug];
                      if (eventData) return eventData;

                      // Fallback for unknown events
                      return {
                        id: slug,
                        name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
                      };
                    })}
                    eventAccess={activePass.eventAccess ?? null}
                    teamSnapshot={activePass.teamSnapshot ?? null}
                    userName={userProfile.name}
                    college={userProfile.college}
                    phone={userProfile.phone}
                    email={userProfile.email}
                  />

                  {/* Download button below details card */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => handleDownloadPDF(activePass)}
                      disabled={downloadingPassId === activePass.id}
                      className="w-full max-w-md bg-linear-to-r from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 border border-neutral-700 rounded-lg px-6 py-3.5 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-neutral-900/50 flex items-center justify-center gap-3"
                    >
                      {downloadingPassId === activePass.id ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Generating PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download size={20} />
                          <span>Download Pass as PDF</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right: 3D Lanyard Badge */}
                <div className="shrink-0 flex justify-center w-full lg:w-auto lg:flex-1 lg:min-w-[500px] h-[600px] lg:h-[750px]">
                  <Lanyard
                    qrCode={activePass.qrCode ?? null}
                    userName={userProfile.name}
                    college={userProfile.college}
                    passType={passTypeLabel[activePass.passType] ?? activePass.passType}
                  />
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
