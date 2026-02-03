'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import QRCode from 'qrcode';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { REGISTRATION_PASSES } from '@/lib/registrationPassesData';
import type { PassType } from '@/lib/firestore-types';

interface RegistrationDoc {
  id: string;
  uid: string;
  passType: PassType;
  amount: number;
  paymentStatus: string;
  qrPayload?: string;
  createdAt?: { toDate: () => Date };
}

export default function MyPassPage() {
  const { user, loading, signIn } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationDoc[]>([]);
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
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
          collection(db, 'registrations'),
          where('uid', '==', user.uid),
          where('paymentStatus', '==', 'PAID')
        );
        const snap = await getDocs(q);
        if (cancelled) return;
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as RegistrationDoc))
          .sort((a, b) => {
            const at = a.createdAt?.toDate?.()?.getTime() ?? 0;
            const bt = b.createdAt?.toDate?.()?.getTime() ?? 0;
            return bt - at;
          });
        setRegistrations(docs);
      } catch (e) {
        console.error('Failed to fetch registrations', e);
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (registrations.length === 0) return;
    const payloads = registrations
      .filter((r) => r.qrPayload)
      .map((r) => ({ id: r.id, payload: r.qrPayload! }));
    let cancelled = false;
    (async () => {
      const map: Record<string, string> = {};
      for (const { id, payload } of payloads) {
        try {
          const url = await QRCode.toDataURL(payload, { width: 200, margin: 1 });
          if (!cancelled) map[id] = url;
        } catch (e) {
          console.error('QR gen failed', id, e);
        }
      }
      if (!cancelled) setQrDataUrls((prev) => ({ ...prev, ...map }));
    })();
    return () => {
      cancelled = true;
    };
  }, [registrations]);

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

  const passLabel = (passType: PassType) =>
    REGISTRATION_PASSES.find((p) => p.passType === passType)?.title ?? passType;

  return (
    <>
      <Navigation />
      <main id="main" className="page_main u-container py-[var(--_spacing---section-space--large)]">
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-white md:text-3xl">My Pass</h1>
          <p className="mt-2 text-white/70">Your registered passes for SANA ARENA</p>
        </div>

        {fetchLoading ? (
          <p className="text-white/70">Loading your passes…</p>
        ) : registrations.length === 0 ? (
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
            {registrations.map((reg) => (
              <li
                key={reg.id}
                className="flex flex-col rounded-lg border border-white/15 bg-white/5 p-6"
              >
                <h2 className="text-lg font-semibold text-white">
                  {passLabel(reg.passType)}
                </h2>
                <p className="mt-1 text-white/70">₹{reg.amount}</p>
                {reg.qrPayload && (
                  <div className="mt-4 flex justify-center">
                    {qrDataUrls[reg.id] ? (
                      <img
                        src={qrDataUrls[reg.id]}
                        alt="Pass QR code"
                        className="h-[200px] w-[200px] rounded border border-white/1 bg-white"
                      />
                    ) : (
                      <div className="h-[200px] w-[200px] animate-pulse rounded bg-white/10" />
                    )}
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
