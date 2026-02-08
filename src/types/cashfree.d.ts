declare module '@cashfreepayments/cashfree-js' {
    export interface LoadOptions {
        mode: 'sandbox' | 'production';
    }

    export interface CheckoutOptions {
        paymentSessionId: string;
        redirectTarget?: '_modal' | '_self' | '_blank' | '_top' | '_parent';
        returnUrl?: string;
    }

    export interface CheckoutResult {
        error?: {
            message?: string;
            code?: string;
        };
        redirect?: boolean;
        paymentDetails?: {
            paymentMessage?: string;
            paymentId?: string;
        };
    }

    export interface CashfreeInstance {
        checkout: (options: CheckoutOptions) => Promise<CheckoutResult>;
    }

    export function load(options: LoadOptions): Promise<CashfreeInstance>;
}
