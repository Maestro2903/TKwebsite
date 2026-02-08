'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading, signIn } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const verifyPayment = useCallback(async (orderId: string) => {
    console.log(`Starting verification for order: ${orderId}`);
    setStatus('verifying');
    setErrorMsg(null);

    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      console.log(`Verification response status: ${response.status}`);
      const result = await response.json();
      console.log('Verification result:', result);

      if (response.ok && result.success) {
        setStatus('success');
        setTimeout(() => router.push('/register/my-pass'), 3000);
      } else {
        console.error('Verification failed:', result.error);
        setErrorMsg(result.error || 'Verification failed');
        setStatus('failed');
      }
    } catch (err) {
      console.error('Network error during verification:', err);
      setErrorMsg('Network error. Please check your connection.');
      setStatus('failed');
    }
  }, [router]);

  useEffect(() => {
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      router.push('/register');
      return;
    }

    verifyPayment(orderId);
  }, [searchParams, router, verifyPayment]);

  const handleRetry = () => {
    const orderId = searchParams.get('order_id');
    if (orderId) {
      verifyPayment(orderId);
    }
  };

  if (!user && !loading) {
    return (
      <>
        <Navigation />
        <main className="page_main min-h-[60vh] flex flex-col items-center justify-center u-container py-16">
          <p className="text-white/80 mb-6">Sign in to view your payment status.</p>
          <button
            type="button"
            onClick={() => signIn()}
            className="rounded bg-white px-6 py-3 font-semibold text-black hover:opacity-90"
          >
            Sign in with Google
          </button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="page_main min-h-[60vh] flex flex-col items-center justify-center u-container py-16">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl md:p-12">
          {status === 'verifying' && (
            <div className="flex flex-col items-center gap-6">
              <div className="relative h-16 w-16">
                <div className="absolute h-full w-full rounded-full border-4 border-white/10" />
                <div className="absolute h-full w-full animate-spin rounded-full border-4 border-t-accent" />
              </div>
              <div className="text-center">
                <h1 className="mb-2 text-2xl font-bold text-white">Verifying Payment</h1>
                <p className="text-white/60">Please do not refresh the page...</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="text-center">
                <h1 className="mb-2 text-2xl font-bold text-white">Payment Successful!</h1>
                <p className="text-green-400">Redirecting to your pass...</p>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                <svg
                  className="h-8 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div className="text-center">
                <h1 className="mb-2 text-2xl font-bold text-white">Verification Pending</h1>
                <p className="mb-6 text-white/60">
                  {errorMsg || "We couldn't confirm your payment status automatically."}
                </p>
                <div className="flex flex-col gap-3 w-full">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="rounded bg-accent px-6 py-2 font-semibold text-white hover:opacity-90 transition-all hover:scale-105"
                  >
                    Retry Verification
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/register')}
                    className="rounded border border-white/20 bg-transparent px-6 py-2 font-semibold text-white hover:bg-white/10"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-accent" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
