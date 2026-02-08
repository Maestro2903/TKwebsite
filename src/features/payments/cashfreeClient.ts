'use client';

import { load } from '@cashfreepayments/cashfree-js';

// Singleton pattern for SDK instance
let cashfreeInstance: Awaited<ReturnType<typeof load>> | null = null;

async function getCashfree() {
  if (!cashfreeInstance) {
    const mode = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production'
      ? 'production'
      : 'sandbox';
    cashfreeInstance = await load({ mode });
  }
  return cashfreeInstance;
}

export interface CheckoutResult {
  success: boolean;
  message?: string;
}

/**
 * Opens the Cashfree checkout popup/modal.
 * @param paymentSessionId - The payment session ID from the create-order API
 * @param orderId - The order ID for callback navigation
 * @returns Promise with success status and optional message
 */
export async function openCashfreeCheckout(
  paymentSessionId: string,
  orderId?: string
): Promise<CheckoutResult> {
  const cf = await getCashfree();

  const checkoutOptions = {
    paymentSessionId,
    redirectTarget: '_modal' as const, // Popup checkout mode
  };

  const result = await cf.checkout(checkoutOptions);

  if (result.error) {
    // User closed popup or payment error occurred
    console.log('Payment error or popup closed:', result.error);
    return {
      success: false,
      message: result.error.message || 'Payment cancelled or failed',
    };
  }

  if (result.redirect) {
    // Rare case: payment page couldn't open in same window (e.g., in-app browser)
    // Customer will be redirected to return_url after payment
    console.log('Payment will be redirected');
    return {
      success: true,
      message: 'Payment redirecting...'
    };
  }

  if (result.paymentDetails) {
    // Payment completed (success or failure), check status via verify API
    console.log('Payment completed:', result.paymentDetails.paymentMessage);
    return {
      success: true,
      message: result.paymentDetails.paymentMessage,
    };
  }

  // Fallback
  return { success: false, message: 'Unknown payment result' };
}
