declare global {
  interface Window {
    Cashfree?: (opts: { mode: 'sandbox' | 'production' }) => {
      checkout: (opts: {
        paymentSessionId: string;
        returnUrl?: string;
        redirectTarget?: string;
        onPaymentFailure?: () => void;
        onPaymentSuccess?: () => void;
        onClose?: () => void;
      }) => Promise<unknown>;
    };
  }
}

const SCRIPT_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js';

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Not in browser'));
  if (document.querySelector(`script[src="${SCRIPT_URL}"]`)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
    document.head.appendChild(script);
  });
}

export async function openCashfreeCheckout(paymentSessionId: string): Promise<void> {
  await loadScript();
  const Cashfree = window.Cashfree;
  if (!Cashfree) throw new Error('Cashfree SDK not available');
  const mode = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
  const cf = Cashfree({ mode });
  
  await cf.checkout({ 
    paymentSessionId,
    redirectTarget: '_modal'
  });
}
