import * as admin from 'firebase-admin';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

function verifySignature(timestamp: string, rawBody: string, signature: string, secret: string): boolean {
  const signStr = timestamp + rawBody;
  const expected = crypto.createHmac('sha256', secret).update(signStr).digest('base64');
  return expected === signature;
}

export async function POST(req: Request) {
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const timestamp = req.headers.get('x-webhook-timestamp') ?? '';
  const signature = req.headers.get('x-webhook-signature') ?? '';
  const rawBody = await req.text();

  if (!timestamp || !signature || !rawBody) {
    return NextResponse.json({ error: 'Missing headers or body' }, { status: 400 });
  }

  if (!verifySignature(timestamp, rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: { type?: string; data?: { order?: { order_id?: string } } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (payload.type !== 'PAYMENT_SUCCESS_WEBHOOK') {
    return NextResponse.json({ ok: true });
  }

  const orderId = payload.data?.order?.order_id;
  if (!orderId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const firestore = getAdminFirestore();
    const snap = await firestore
      .collection('registrations')
      .where('cashfreeOrderId', '==', orderId)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ ok: true });
    }

    const doc = snap.docs[0];
    const qrPayload = doc.id;

    await doc.ref.update({
      paymentStatus: 'PAID',
      qrPayload,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Optional: send confirmation email (fire-and-forget). Add Resend/other when ready.
    // sendConfirmationEmail(doc.data(), ...).catch(console.error);
  } catch (e) {
    console.error('Cashfree webhook error', e);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
