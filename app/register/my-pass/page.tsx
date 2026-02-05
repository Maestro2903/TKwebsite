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

interface PassDoc {
  id: string;
  userId: string;
  passType: string;
  amount: number;
  status: string;
  qrCode: string;
  createdAt?: { toDate: () => Date };
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
        ) : passes.length === 0 ? (
          <div className="rounded-lg border border-white/15 bg-white/5 p-8 text-center">
            <p className="text-white/80">You don’t have any paid passes yet.</p>
            <Link
              href="/register"
              className="mt-4 inline-block rounded bg-white px-6 py-2 font-semibold text-black hover:opacity-90"
            >
              Get a pass
            </Link>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {passes.map((pass) => (
              <li
                key={pass.id}
                className="flex flex-col rounded-lg border border-white/15 bg-white/5 p-6"
              >
                <h2 className="text-lg font-semibold text-white">
                  {passTypeLabel[pass.passType] ?? pass.passType}
                </h2>
                <p className="mt-1 text-white/70">₹{pass.amount}</p>
                {pass.qrCode && (
                  <div className="mt-4 mb-2 flex justify-center items-center py-6">
                    <img
                      src={pass.qrCode}
                      alt="Pass QR code"
                      className="w-full max-w-[280px] h-auto aspect-square object-contain rounded bg-white"
                      style={{ padding: '12px' }}
                    />
                  </div>
                )}
                <p className="mt-2 text-center text-xs text-white/50">
                  Show this QR at entry
                </p>
                <button
                  onClick={() => handleDownloadPDF(pass)}
                  disabled={downloadingPassId === pass.id}
                  className="mt-4 w-full rounded bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingPassId === pass.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating PDF...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download as PDF
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
