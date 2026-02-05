import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/backend/lib/firebase-admin';
import { PASS_TYPES } from '@/lib/types';
import { checkRateLimit } from '@/backend/lib/rate-limit';

const CASHFREE_BASE =
  process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

export async function POST(req: NextRequest) {
  const rateLimitResponse = await checkRateLimit(req, { limit: 5, windowMs: 60000 });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const authHeader = req.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: { uid: string };
    try {
      decoded = await getAdminAuth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { userId, amount, passType, teamData, teamId } = body;

    if (decoded.uid !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const validPass = Object.values(PASS_TYPES).find((p) => p.id === passType);
    if (!validPass) {
      return NextResponse.json({ error: 'Invalid pass type' }, { status: 400 });
    }

    const expectedAmount =
      passType === 'group_events'
        ? (body.teamMemberCount ?? 1) * ((validPass as { pricePerPerson?: number }).pricePerPerson ?? 250)
        : (validPass as { price?: number }).price ?? 0;
    if (typeof amount !== 'number' || amount !== expectedAmount) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const appId =
      process.env.NEXT_PUBLIC_CASHFREE_APP_ID || process.env.CASHFREE_APP_ID;
    const secret = process.env.CASHFREE_SECRET_KEY;
    if (!appId || !secret) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    const orderId = `order_${Date.now()}_${userId.substring(0, 8)}`;
    
    // Validate and format phone number
    let customerPhone = teamData?.phone || '9999999999';
    customerPhone = customerPhone.replace(/\D/g, ''); // Remove non-digits
    if (customerPhone.length < 10) {
      return NextResponse.json({ error: 'Invalid phone number. Must be at least 10 digits.' }, { status: 400 });
    }
    if (customerPhone.length === 10 && !customerPhone.startsWith('+')) {
      customerPhone = '+91' + customerPhone; // Add India country code
    }
    
    const customerName = teamData?.name || '';
    const customerEmail = teamData?.email || '';

    const requestBody = {
      order_amount: amount,
      order_currency: 'INR',
      order_id: orderId,
      customer_details: {
        customer_id: userId,
        customer_phone: customerPhone,
        ...(customerName && { customer_name: customerName }),
        ...(customerEmail && { customer_email: customerEmail }),
      },
    };

    const response = await fetch(`${CASHFREE_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secret,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree error:', data);
      return NextResponse.json(
        { error: data.message || JSON.stringify(data) },
        { status: 500 }
      );
    }

    // Persist pending payment to Firestore
    const db = getAdminFirestore();
    await db.collection('payments').doc(orderId).set({
      userId,
      amount,
      passType,
      cashfreeOrderId: orderId,
      status: 'pending',
      createdAt: new Date(),
      customerDetails: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      teamId: teamId || null,
      teamMemberCount: body.teamMemberCount || null,
    });

    // If this is a group registration, update the team document with the orderId
    if (teamId && passType === 'group_events') {
      await db.collection('teams').doc(teamId).update({
        orderId: orderId,
        paymentStatus: 'pending',
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      orderId: data.order_id,
      sessionId: data.payment_session_id,
    });
  } catch (error: unknown) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
