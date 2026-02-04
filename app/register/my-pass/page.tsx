'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { PASS_TYPES } from '@/lib/types';

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
                  <div className="mt-4 flex justify-center">
                    <img
                      src={pass.qrCode}
                      alt="Pass QR code"
                      className="h-[200px] w-[200px] rounded border border-white/10 bg-white"
                    />
                  </div>
                )}
                <p className="mt-2 text-center text-xs text-white/50">
                  Show this QR at entry
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
