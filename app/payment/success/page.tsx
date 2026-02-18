'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import Footer from '@/components/layout/Footer';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    
    if (!orderId) {
      setStatus('error');
      return;
    }

    const verifyPayment = async () => {
      try {
        const token = await user?.getIdToken();
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ orderId }),
        });

        if (res.ok) {
          setStatus('success');
          setTimeout(() => router.push('/register/my-pass'), 2000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [searchParams, user, router]);

  return (
    <>
      <main className="page_main page_main--registration registration-loading">
        <div className="registration-loading__spinner">
          {status === 'verifying' && (
            <>
              <div className="reg-spinner" />
              <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>
                Verifying payment...
              </p>
            </>
          )}
          {status === 'success' && (
            <>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
              <p style={{ color: 'var(--color-success)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                Payment Successful!
              </p>
              <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>
                Redirecting to your pass...
              </p>
            </>
          )}
          {status === 'error' && (
            <>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✗</div>
              <p style={{ color: 'var(--color-error)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                Verification Failed
              </p>
              <button
                onClick={() => router.push('/register/pass')}
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
              >
                Back to Registration
              </button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <>
          <main className="page_main page_main--registration registration-loading">
            <div className="registration-loading__spinner">
              <div className="reg-spinner" />
              <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Loading...</p>
            </div>
          </main>
          <Footer />
        </>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
