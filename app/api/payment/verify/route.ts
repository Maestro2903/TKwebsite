import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { sendEmail, emailTemplates } from '@/backend/lib/email';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { createQRPayload } from '@/lib/qr-signing';

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

    // Idempotency check: return existing pass if already created
    const existingPassSnapshot = await db
      .collection('passes')
      .where('paymentId', '==', orderId)
      .limit(1)
      .get();

    if (!existingPassSnapshot.empty) {
      const existingPass = existingPassSnapshot.docs[0];
      const existingData = existingPass.data();
      return NextResponse.json({
        success: true,
        passId: existingPass.id,
        qrCode: existingData.qrCode,
        message: 'Pass already exists',
      });
    }

    const passRef = db.collection('passes').doc();

    // Create signed QR payload
    const qrData = createQRPayload(
      passRef.id,
      paymentData.userId as string,
      paymentData.passType as string
    );

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

    const userDoc = await db
      .collection('users')
      .doc(paymentData.userId as string)
      .get();
    const userData = userDoc.data();

    if (userData?.email) {
      const emailTemplate = emailTemplates.passConfirmation({
        name: userData.name ?? 'there',
        amount: paymentData.amount,
        passType: paymentData.passType,
        college: userData.college ?? '-',
        phone: userData.phone ?? '-',
        qrCodeUrl: qrCodeUrl,
      });

      await sendEmail({
        to: userData.email as string,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
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
