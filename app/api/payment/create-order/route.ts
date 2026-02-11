import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/adminApp';
import { PASS_TYPES } from '@/types/passes';
import { checkRateLimit } from '@/lib/security/rateLimiter';

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
    } catch (tokenError: unknown) {
      const err = tokenError as { code?: string };
      console.error('Token verification failed:', tokenError);
      const isExpired = err?.code === 'auth/id-token-expired';
      return NextResponse.json(
        { error: isExpired ? 'Session expired. Please sign in again.' : 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { userId, amount, passType, teamData, teamId, selectedDays, selectedEvents } = body;

    if (decoded.uid !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const validPass = Object.values(PASS_TYPES).find((p) => p.id === passType);
    if (!validPass) {
      return NextResponse.json({ error: 'Invalid pass type' }, { status: 400 });
    }

    // Calculate expected amount based on pass type
    let expectedAmount: number;
    if (passType === 'group_events') {
      expectedAmount = (body.teamMemberCount ?? 1) * ((validPass as { pricePerPerson?: number }).pricePerPerson ?? 250);
    } else if (passType === 'day_pass' && selectedDays && Array.isArray(selectedDays)) {
      // For day pass with selected days, amount = number of days * price per day
      const daysCount = selectedDays.length;
      expectedAmount = daysCount * ((validPass as { price?: number }).price ?? 500);
    } else {
      expectedAmount = (validPass as { price?: number }).price ?? 0;
    }

    if (typeof amount !== 'number' || amount !== expectedAmount) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Validate selectedEvents - MANDATORY for all pass types
    if (!selectedEvents || !Array.isArray(selectedEvents) || selectedEvents.length === 0) {
      return NextResponse.json({ error: 'Event selection is required' }, { status: 400 });
    }

    // Fetch selected events from Firestore to validate them
    const db = getAdminFirestore();
    const eventDocs = await Promise.all(
      selectedEvents.map((eventId: string) => db.collection('events').doc(eventId).get())
    );

    const events = eventDocs
      .filter(doc => doc.exists)
      .map(doc => ({ id: doc.id, ...doc.data() }));

    if (events.length !== selectedEvents.length) {
      return NextResponse.json({ error: 'Some selected events do not exist' }, { status: 400 });
    }

    // Check if events are active
    const inactiveEvents = events.filter((e: any) => !e.isActive);
    if (inactiveEvents.length > 0) {
      return NextResponse.json({ 
        error: `These events are not currently active: ${inactiveEvents.map((e: any) => e.name).join(', ')}` 
      }, { status: 400 });
    }

    // Validate events based on pass type
    if (passType === 'day_pass' && selectedDays && selectedDays.length > 0) {
      const invalidEvents = events.filter((e: any) => !selectedDays.includes(e.date));
      if (invalidEvents.length > 0) {
        return NextResponse.json({ 
          error: `Events must match selected days. Invalid events: ${invalidEvents.map((e: any) => e.name).join(', ')}` 
        }, { status: 400 });
      }
    }

    if (passType === 'group_events') {
      if (selectedEvents.length !== 1) {
        return NextResponse.json({ error: 'Group pass must select exactly one event' }, { status: 400 });
      }
      const event = events[0] as any;
      if (event.type !== 'group') {
        return NextResponse.json({ error: 'Selected event must be a group event' }, { status: 400 });
      }
    }

    if (passType === 'proshow') {
      const proshowDays = ['2026-02-26', '2026-02-28']; // Day 1 and Day 3
      const invalidEvents = events.filter((e: any) => !proshowDays.includes(e.date));
      if (invalidEvents.length > 0) {
        return NextResponse.json({ 
          error: `Proshow pass can only select Day 1 and Day 3 events. Invalid: ${invalidEvents.map((e: any) => e.name).join(', ')}` 
        }, { status: 400 });
      }
    }

    // Validate allowedPassTypes for each event
    const deniedEvents = events.filter((e: any) => !e.allowedPassTypes || !e.allowedPassTypes.includes(passType));
    if (deniedEvents.length > 0) {
      return NextResponse.json({ 
        error: `These events are not available for ${passType}: ${deniedEvents.map((e: any) => e.name).join(', ')}` 
      }, { status: 400 });
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

    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const dynamicBaseUrl = `${protocol}://${host}`;

    // Priority: NEXT_PUBLIC_APP_URL > APP_URL > detected host
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || dynamicBaseUrl)?.replace(/\/$/, '');

    console.log(`[Order] Using baseUrl: ${baseUrl}`);

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
      order_meta: {
        return_url: `${baseUrl}/payment/callback?order_id=${orderId}`,
        notify_url: `${baseUrl}/api/webhooks/cashfree`,
      },
    };

    console.log('[Order] Request to Cashfree:', JSON.stringify(requestBody, null, 2));

    // Track created team for cleanup if Cashfree fails
    let createdTeamId: string | null = null;

    let response;
    let data;

    try {
      response = await fetch(`${CASHFREE_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': appId,
          'x-client-secret': secret,
          'x-api-version': '2025-01-01',
        },
        body: JSON.stringify(requestBody),
      });

      data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || JSON.stringify(data));
      }
    } catch (cashfreeError) {
      // If team was created, delete it
      if (passType === 'group_events' && createdTeamId) {
        try {
          await db.collection('teams').doc(createdTeamId).delete();
          console.log(`[Order] Cleaned up orphan team: ${createdTeamId}`);
        } catch (cleanupError) {
          console.error('[Order] Failed to cleanup team:', cleanupError);
        }
      }

      console.error('Cashfree error:', cashfreeError);
      return NextResponse.json(
        { error: cashfreeError instanceof Error ? cashfreeError.message : 'Payment gateway error' },
        { status: 500 }
      );
    }

    // Persist pending payment to Firestore
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
      selectedDays: selectedDays || null,
      selectedEvents: selectedEvents || [],
    });

    // For group registration, create the team document here to ensure ACID consistency
    if (passType === 'group_events') {
      const teamId = body.teamId;
      if (!teamId) throw new Error('Missing teamId for group registration');

      // Track team for cleanup if needed
      createdTeamId = teamId;

      // Check if team already exists to avoid duplicates
      const teamRef = db.collection('teams').doc(teamId);
      const teamDoc = await teamRef.get();

      if (!teamDoc.exists) {
        // Construct members array for the team document
        const membersData = [
          // Leader (the account user)
          {
            memberId: `leader_${Date.now()}_${userId.substring(0, 8)}`,
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            isLeader: true,
            attendance: { checkedIn: false, checkInTime: null, checkedInBy: null },
          },
          // Other members from request
          ...(body.members || []).map((m: any, idx: number) => ({
            memberId: `member_${Date.now()}_${idx}`,
            name: m.name.trim(),
            phone: m.phone.trim(),
            email: m.email.trim(),
            isLeader: false,
            attendance: { checkedIn: false, checkInTime: null, checkedInBy: null },
          })),
        ];

        await teamRef.set({
          teamId,
          teamName: (body.teamName || customerName).trim(),
          leaderId: userId,
          leaderName: customerName,
          leaderEmail: customerEmail,
          leaderPhone: customerPhone,
          leaderCollege: (body.college || body.teamData?.college || '').trim(),
          members: membersData,
          totalMembers: membersData.length,
          totalAmount: amount,
          status: 'pending',
          orderId: orderId,
          paymentStatus: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // If team exists, just update the order reference
        await teamRef.update({
          orderId: orderId,
          paymentStatus: 'pending',
          updatedAt: new Date(),
        });
      }
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
