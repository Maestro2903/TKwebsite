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

// Build a slug → display-name map from events data
const EVENT_NAME_MAP: Record<string, string> = {};
[...NON_TECHNICAL_EVENTS, ...TECHNICAL_EVENTS].forEach((e) => {
  EVENT_NAME_MAP[e.id] = e.name;
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

const passTypeLabel: Record<string, string> = {
  test_pass: PASS_TYPES.TEST_PASS.name,
  day_pass: PASS_TYPES.DAY_PASS.name,
  group_events: PASS_TYPES.GROUP_EVENTS.name,
  proshow: PASS_TYPES.PROSHOW.name,
  sana_concert: PASS_TYPES.SANA_CONCERT.name,
};

export default function MyPassPage() {
  const { user, userData, loading, signIn } = useAuth();
  const [passes, setPasses] = useState<PassDoc[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [downloadingPassId, setDownloadingPassId] = useState<string | null>(null);
  const [activePassIndex, setActivePassIndex] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

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
          <h1 className="text-2xl font-semibold text-white md:text-3xl font-orbitron tracking-tight">
            My Pass
          </h1>
          <p className="mt-2 text-white/60 text-sm">
            Your registered passes for CIT Takshashila 2026
          </p>
        </div>

        {fetchLoading ? (
          <p className="text-white/70">Loading your passes…</p>
        ) : passes.length === 0 ? (
          <div className="rounded-lg border border-white/15 bg-white/5 p-8 text-center flex flex-col items-center gap-4">
            <p className="text-white/80">You don&apos;t have any paid passes yet.</p>
            <Link
              href="/register"
              className="inline-block rounded bg-white px-6 py-2 font-semibold text-black hover:opacity-90"
            >
              Get a pass
            </Link>
          </div>
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
                    className={`px-4 py-2 rounded-lg text-xs font-orbitron uppercase tracking-wider border transition-all duration-200 ${
                      i === activePassIndex
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
                    selectedEvents={(activePass.selectedEvents ?? []).map((slug: string) => EVENT_NAME_MAP[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()))}
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
