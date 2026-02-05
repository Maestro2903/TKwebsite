'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading, signIn } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    const orderId = searchParams.get('order_id');

    if (loading) return;

    if (!orderId) {
      router.push('/register');
      return;
    }

    if (!user) {
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setStatus('success');
          setTimeout(() => router.push('/register/my-pass'), 3000);
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [searchParams, router, user, loading]);

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
      <main className="page_main min-h-[60vh] flex items-center justify-center p-4">
        <div className="reg-gradient-bg rounded-3xl p-8 w-full max-w-md">
          <div className="reg-glass-card p-12 text-center max-w-md w-full mx-auto">
            {status === 'verifying' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <div className="reg-spinner w-10 h-10 border-2 border-white/30 border-t-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
                <p className="text-gray-500">Please wait while we confirm your payment...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
                <p className="text-gray-500 mb-6">Your pass has been generated and sent to your email.</p>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 mb-6">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Check your email for the QR code</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Redirecting to My Pass...</p>
              </>
            )}

            {status === 'failed' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
                <p className="text-gray-500 mb-6">Something went wrong with your payment.</p>
                <button
                  type="button"
                  onClick={() => router.push('/register')}
                  className="reg-btn-primary w-full"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
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
        <>
          <Navigation />
          <main className="page_main min-h-[60vh] flex items-center justify-center u-container py-16">
            <div className="reg-spinner" />
          </main>
          <Footer />
        </>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
