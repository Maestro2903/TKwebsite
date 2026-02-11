'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/clientApp';
import { useAuth } from '@/features/auth/AuthContext';
import { openCashfreeCheckout } from '@/features/payments/cashfreeClient';
import type { RegistrationPass } from '@/data/passes';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

interface RegistrationFormModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  pass: RegistrationPass | null;
}

export default function RegistrationFormModal({
  isOpen,
  onCloseAction,
  pass,
}: RegistrationFormModalProps) {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setPhone('');
    setCollege('');
  }, [isOpen, pass?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseAction();
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onCloseAction]);

  // Lock global body scroll (and Lenis) when modal is open
  useLockBodyScroll(isOpen);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !pass) return;
      setError(null);
      setSubmitting(true);

      try {
        const uid = user.uid;
        const email = user.email || user.providerData?.[0]?.email || '';
        const name = user.displayName || email || 'Attendee';

        await setDoc(
          doc(db, 'users', uid),
          {
            uid,
            name,
            email,
            college: college.trim(),
            phone: phone.trim(),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );

        const token = await auth.currentUser?.getIdToken(true);
        if (!token) throw new Error('Not signed in');

        const res = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: uid,
            passType: pass.passType,
            amount: pass.amount,
            teamData: {
              uid,
              name,
              email,
              phone: phone.trim(),
              college: college.trim(),
            },
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to create order');
        }

        const data = (await res.json()) as { sessionId?: string; orderId?: string };
        const sessionId = data.sessionId;
        const orderId = data.orderId;

        if (!sessionId || !orderId) throw new Error('No payment session');

        onCloseAction();
        const result = await openCashfreeCheckout(sessionId, orderId);

        if (result.success) {
          // Navigate to callback page to verify payment
          window.location.href = `/payment/callback?order_id=${orderId}`;
        } else {
          throw new Error(result.message || 'Payment failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setSubmitting(false);
      }
    },
    [user, pass, phone, college, onCloseAction]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-form-title"
      onClick={(e) => e.target === overlayRef.current && onCloseAction()}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div
        className="modal-content-scroll w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border border-white/15 bg-black p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="registration-form-title" className="text-xl font-semibold text-white">
            Step 3: Enter details & pay
          </h2>
          <p className="sr-only">After payment you’ll get your entry QR on My Pass.</p>
          <button
            type="button"
            className="text-white/70 hover:text-white"
            aria-label="Close"
            onClick={onCloseAction}
          >
            ×
          </button>
        </div>

        {pass && (
          <p className="mb-4 text-sm text-white/70">
            {pass.title} — ₹{pass.amount}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-phone" className="mb-1 block text-sm text-white/80">
              Phone <span className="text-white/50">*</span>
            </label>
            <input
              id="reg-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full rounded border border-white/2 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="reg-college" className="mb-1 block text-sm text-white/80">
              College <span className="text-white/50">*</span>
            </label>
            <input
              id="reg-college"
              type="text"
              required
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="Your college name"
              className="w-full rounded border border-white/2 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCloseAction}
              className="flex-1 rounded border border-white/2 py-2 text-sm font-medium text-white/80 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded bg-white py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
              style={{ color: '#000000' }}
            >
              {submitting ? 'Please wait…' : 'Pay ₹' + (pass?.amount ?? 0)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
