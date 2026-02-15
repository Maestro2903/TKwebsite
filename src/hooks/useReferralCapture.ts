'use client';

import { useEffect } from 'react';

export const REFERRAL_STORAGE_KEY = 'tk_referral_code';

/**
 * Captures ?ref=CODE from URL and stores in localStorage for the referral flow.
 * Removes the ref param from the URL to avoid leakage.
 */
export function useReferralCapture() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');

    if (ref && ref.trim()) {
      try {
        localStorage.setItem(REFERRAL_STORAGE_KEY, ref.trim());

        // Remove ref from URL without triggering navigation
        params.delete('ref');
        const newSearch = params.toString();
        const newUrl = newSearch
          ? `${window.location.pathname}?${newSearch}`
          : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } catch (e) {
        console.warn('Could not store referral code:', e);
      }
    }
  }, []);
}
