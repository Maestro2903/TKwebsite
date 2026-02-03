import * as admin from 'firebase-admin';
import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { REGISTRATION_PASSES } from '@/lib/registrationPassesData';
import type { PassType } from '@/lib/firestore-types';

const CASHFREE_BASE = process.env.CASHFREE_APP_ID?.startsWith('TEST')
  ? 'https://sandbox.cashfree.com/pg'
  : 'https://api.cashfree.com/pg';

interface CreateOrderBody {
  passType: PassType;
  amount: number;
  customer: { uid: string; email: string; phone: string; name: string };
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const body = (await req.json()) as CreateOrderBody;
    const { passType, amount, customer } = body;
    if (!passType || typeof amount !== 'number' || !customer?.uid || !customer.email || !customer.phone || !customer.name) {
      return NextResponse.json({ error: 'Missing or invalid body' }, { status: 400 });
    }
    if (customer.uid !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const pass = REGISTRATION_PASSES.find((p) => p.passType === passType);
    if (!pass || pass.amount !== amount) {
      return NextResponse.json({ error: 'Invalid pass or amount' }, { status: 400 });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secret = process.env.CASHFREE_SECRET_KEY;
    if (!appId || !secret) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    const origin = req.headers.get('origin') || req.headers.get('x-forwarded-host') || 'http://localhost:3000';
    const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;
    const returnUrl = `${baseUrl}/register/success`;

    const cfRes = await fetch(`${CASHFREE_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secret,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify({
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customer.uid,
          customer_email: customer.email,
          customer_phone: customer.phone,
          customer_name: customer.name,
        },
        order_meta: { return_url: returnUrl },
      }),
    });

    if (!cfRes.ok) {
      const err = await cfRes.text();
      console.error('Cashfree create order failed', cfRes.status, err);
      return NextResponse.json({ error: 'Payment gateway error' }, { status: 502 });
    }

    const data = (await cfRes.json()) as {
      cf_order_id?: string;
      order_id?: string;
      payment_session_id?: string;
    };
    const cfOrderId = data.cf_order_id || data.order_id;
    const paymentSessionId = data.payment_session_id;
    if (!cfOrderId || !paymentSessionId) {
      return NextResponse.json({ error: 'Invalid gateway response' }, { status: 502 });
    }

    const firestore = getAdminFirestore();
    await firestore.collection('registrations').add({
      uid,
      passType,
      amount,
      paymentStatus: 'PENDING',
      cashfreeOrderId: cfOrderId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      order_id: cfOrderId,
      payment_session_id: paymentSessionId,
    });
  } catch (e) {
    console.error('create-order error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
