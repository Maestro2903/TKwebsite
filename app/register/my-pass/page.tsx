'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import { useAuth } from '@/features/auth/AuthContext';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { PASS_TYPES } from '@/types/passes';
import { generatePassPDF } from '@/features/passes/pdfGenerator.client';
import MyPassCard from '@/components/ui/MyPassCard';

interface PassDoc {
  id: string;
  userId: string;
  passType: string;
  amount: number;
  status: string;
  qrCode: string;
  createdAt?: { toDate: () => Date };
  teamSnapshot?: {
    teamName: string;
    members: Array<{ name: string; isLeader?: boolean }>;
  };
}

const passTypeLabel: Record<string, string> = {
  day_pass: PASS_TYPES.DAY_PASS.name,
  group_events: PASS_TYPES.GROUP_EVENTS.name,
  proshow: PASS_TYPES.PROSHOW.name,
  sana_concert: PASS_TYPES.SANA_CONCERT.name,
};

export default function MyPassPage() {
  const { user, loading, signIn } = useAuth();
  const [passes, setPasses] = useState<PassDoc[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [downloadingPassId, setDownloadingPassId] = useState<string | null>(null);

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
        <main id="main" className="page_main min-h-[60vh] flex flex-col items-center justify-center u-container py-16">
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

  return (
    <>
      <Navigation />
      <main id="main" className="page_main u-container py-[var(--_spacing---section-space--large)]">
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-white md:text-3xl">My Pass</h1>
          <p className="mt-2 text-white/70">Your registered passes for CIT Takshashila 2026</p>
        </div>

        {fetchLoading ? (
          <p className="text-white/70">Loading your passes…</p>
        ) : (
          <>
            {passes.length === 0 ? (
              <div className="rounded-lg border border-white/15 bg-white/5 p-8 text-center flex flex-col items-center gap-4">
                <p className="text-white/80">You don’t have any paid passes yet.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/register"
                    className="inline-block rounded bg-white px-6 py-2 font-semibold text-black hover:opacity-90"
                  >
                    Get a pass
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {passes.map((pass) => (
                    <li key={pass.id} className="flex justify-center">
                      <MyPassCard
                        title={passTypeLabel[pass.passType] ?? pass.passType}
                        amount={pass.amount}
                        qrCode={pass.qrCode ?? null}
                        onDownloadPDF={() => handleDownloadPDF(pass)}
                        isDownloading={downloadingPassId === pass.id}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
