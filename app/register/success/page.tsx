'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Footer from '@/components/layout/Footer';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      router.replace('/register/my-pass');
      return;
    }
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown, router]);

  return (
    <main id="main" className="page_main min-h-[60vh] flex flex-col items-center justify-center u-container py-16">
      <div className="max-w-lg text-center">
        <h1 className="mb-4 text-2xl font-semibold text-white md:text-3xl">
          Payment submitted
        </h1>
        <p className="mb-6 text-white/70">
          Your payment is being processed. You will receive a confirmation once it is complete.
          You can also view your pass below.
        </p>
        {orderId && (
          <p className="mb-6 font-mono text-sm text-white/50">Order: {orderId}</p>
        )}
        <Link
          href="/register/my-pass"
          className="inline-block rounded bg-white px-6 py-3 font-semibold text-black transition hover:opacity-90"
        >
          View my pass
        </Link>
        <p className="mt-6 text-sm text-white/50">
          Redirecting to My Pass in {countdown}…
        </p>
      </div>
    </main>
  );
}

export default function RegisterSuccessPage() {
  return (
    <>
      <Suspense fallback={
        <main className="page_main min-h-[60vh] flex items-center justify-center u-container py-16" aria-label="Loading">
          <p className="text-white/70">Loading…</p>
        </main>
      }>
        <SuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}
