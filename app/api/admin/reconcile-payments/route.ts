/**
 * GET  /api/admin/reconcile-payments
 * Cross-check payments vs passes. Returns payments that have no pass and callback URLs.
 *
 * Query:
 *   fix=1  Optional. For each payment without a pass, call fix-stuck-payment to create the pass.
 *
 * Protect at infrastructure level (e.g. IP allowlist).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/adminApp';

export async function GET(req: NextRequest) {
  try {
    const db = getAdminFirestore();
    const fix = req.nextUrl.searchParams.get('fix') === '1';

    const baseUrl =
      (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://cittakshashila.org').replace(
        /\/$/,
        ''
      );

    const paymentsSnap = await db.collection('payments').get();
    const passesSnap = await db.collection('passes').get();

    const passByPaymentId = new Map<string, { id: string; data: Record<string, unknown> }>();
    passesSnap.docs.forEach((d) => {
      const data = d.data();
      const paymentId = data.paymentId as string;
      if (paymentId) passByPaymentId.set(paymentId, { id: d.id, data });
    });

    const withPass: { orderId: string; paymentId: string; passId: string; status: string }[] = [];
    const withoutPass: {
      orderId: string;
      paymentId: string;
      status: string;
      userId: string;
      passType: string;
      amount: number;
      callbackUrl: string;
    }[] = [];

    paymentsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const orderId = (data.cashfreeOrderId as string) || doc.id;
      const pass = passByPaymentId.get(orderId);
      if (pass) {
        withPass.push({
          orderId,
          paymentId: doc.id,
          passId: pass.id,
          status: (data.status as string) || '',
        });
      } else {
        withoutPass.push({
          orderId,
          paymentId: doc.id,
          status: (data.status as string) || '',
          userId: (data.userId as string) || '',
          passType: (data.passType as string) || '',
          amount: (data.amount as number) ?? 0,
          callbackUrl: `${baseUrl}/payment/callback?order_id=${encodeURIComponent(orderId)}`,
        });
      }
    });

    let fixed: { orderId: string; success: boolean; passCreated?: boolean; error?: string }[] = [];

    // Only generate pass/QR for payments without pass when status is already 'success'
    const toFix = fix ? withoutPass.filter((row) => row.status === 'success') : [];

    if (toFix.length > 0) {
      for (const row of toFix) {
        try {
          const res = await fetch(`${baseUrl}/api/admin/fix-stuck-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: row.orderId }),
          });
          const body = await res.json().catch(() => ({}));
          fixed.push({
            orderId: row.orderId,
            success: res.ok && (body.success === true),
            passCreated: body.passCreated,
            error: res.ok ? undefined : (body.error as string) || res.statusText,
          });
        } catch (err) {
          fixed.push({
            orderId: row.orderId,
            success: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    const withoutPassSuccess = withoutPass.filter((r) => r.status === 'success');

    return NextResponse.json({
      summary: {
        totalPayments: paymentsSnap.size,
        withPass: withPass.length,
        withoutPass: withoutPass.length,
        withoutPassButSuccess: withoutPassSuccess.length,
        message: withoutPassSuccess.length
          ? `${withoutPassSuccess.length} payment(s) have status success but no pass — use ?fix=1 to generate pass (QR) for them.`
          : undefined,
      },
      withPass,
      withoutPass,
      ...(fixed.length > 0 && { fixed }),
    });
  } catch (error) {
    console.error('[ReconcilePayments]', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Server error',
      },
      { status: 500 }
    );
  }
}
