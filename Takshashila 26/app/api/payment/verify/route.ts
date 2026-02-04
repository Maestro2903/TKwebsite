import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { Resend } from 'resend';
import { getAdminFirestore } from '@/lib/firebase-admin';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const CASHFREE_BASE =
  process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const appId =
      process.env.NEXT_PUBLIC_CASHFREE_APP_ID || process.env.CASHFREE_APP_ID;
    const secret = process.env.CASHFREE_SECRET_KEY;
    if (!appId || !secret) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    const response = await fetch(
      `${CASHFREE_BASE}/orders/${orderId}/payments`,
      {
        headers: {
          'x-client-id': appId,
          'x-client-secret': secret,
          'x-api-version': '2023-08-01',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 500 }
      );
    }

    const payments = await response.json();
    const paymentStatus = payments[0]?.payment_status || 'FAILED';

    if (paymentStatus !== 'SUCCESS') {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      );
    }

    const paymentsSnapshot = await db
      .collection('payments')
      .where('cashfreeOrderId', '==', orderId)
      .limit(1)
      .get();

    if (paymentsSnapshot.empty) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const paymentDoc = paymentsSnapshot.docs[0];
    const paymentData = paymentDoc.data();

    await paymentDoc.ref.update({ status: 'success' });

    const passRef = db.collection('passes').doc();
    const qrData = JSON.stringify({
      passId: passRef.id,
      userId: paymentData.userId,
      passType: paymentData.passType,
      teamId: paymentData.teamId ?? null,
    });

    const qrCodeUrl = await QRCode.toDataURL(qrData);

    await passRef.set({
      userId: paymentData.userId,
      passType: paymentData.passType,
      amount: paymentData.amount,
      paymentId: orderId,
      status: 'paid',
      qrCode: qrCodeUrl,
      createdAt: new Date(),
    });

    if (resend) {
      const userDoc = await db
        .collection('users')
        .doc(paymentData.userId as string)
        .get();
      const userData = userDoc.data();
      if (userData?.email) {
        resend.emails
          .send({
            from: 'onboarding@resend.dev',
            to: userData.email as string,
            subject: 'Event Registration Confirmed - CIT Takshashila 2026',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #7c3aed;">Registration Confirmed!</h1>
              <p>Hi <strong>${userData.name ?? 'there'}</strong>,</p>
              <p>Your payment of <strong>₹${paymentData.amount}</strong> has been confirmed.</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Pass Type:</strong> ${paymentData.passType}</p>
                <p><strong>College:</strong> ${userData.college ?? '-'}</p>
                <p><strong>Phone:</strong> ${userData.phone ?? '-'}</p>
              </div>
              <p><strong>Please show this QR code at the event:</strong></p>
              <img src="${qrCodeUrl}" alt="QR Code" style="width: 300px; height: 300px;" />
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                See you at CIT Takshashila 2026!
              </p>
            </div>
          `,
          })
          .catch((err: unknown) => console.log('Email error:', err));
      }
    }

    return NextResponse.json({
      success: true,
      passId: passRef.id,
      qrCode: qrCodeUrl,
    });
  } catch (error: unknown) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
