import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/adminApp';
import { validateRegistrationInput } from '@/lib/validation/registration';
import type { Registration } from '@/lib/db/firestoreTypes';
import { enqueueEmail } from '@/features/email/firestoreEmail';

export async function POST(req: NextRequest) {
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
    const {
      passType,
      selectedEvents,
      selectedDays,
      teamMemberCount,
      teamData,
      name,
      email,
      phone,
      college,
    } = body;

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof phone !== 'string' ||
      typeof college !== 'string'
    ) {
      return NextResponse.json({ error: 'Missing or invalid user details' }, { status: 400 });
    }

    const db = getAdminFirestore();

    const existingPendingSnap = await db
      .collection('registrations')
      .where('userId', '==', decoded.uid)
      .where('passType', '==', passType)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (!existingPendingSnap.empty) {
      const existing = existingPendingSnap.docs[0];
      return NextResponse.json(
        {
          error: 'You already have a pending registration for this pass type',
          registrationId: existing.id,
        },
        { status: 409 }
      );
    }

    let calculatedAmount: number;
    try {
      const validationResult = await validateRegistrationInput({
        passType,
        selectedEvents,
        selectedDays,
        teamMemberCount,
      });
      calculatedAmount = validationResult.calculatedAmount;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid registration input';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const registrationRef = db.collection('registrations').doc();

    const registrationData: Registration = {
      userId: decoded.uid,
      name,
      email,
      phone,
      college,
      passType,
      selectedEvents,
      selectedDays: selectedDays ?? [],
      ...(teamData != null ? { teamData } : {}),
      calculatedAmount,
      status: 'pending',
      createdAt: new Date(),
    };

    await registrationRef.set(registrationData);

    const subject = 'Registration received – payment pending';
    const html = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
        <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 12px;">
          Thanks for registering for CIT Takshashila 2026
        </h1>
        <p style="font-size: 15px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
          Hi <strong>${name}</strong>, we&apos;ve received your registration. Your payment is still pending.
        </p>
        <div style="background: #F3F4F6; padding: 16px 20px; border-radius: 10px; margin-bottom: 16px;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>Pass type:</strong> ${passType}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Estimated amount:</strong> ₹${calculatedAmount}</p>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #4B5563; margin-bottom: 16px;">
          Please complete payment at the venue to receive your official QR pass. You can still edit your registration from the profile page while it is pending.
        </p>
        <p style="font-size: 13px; color: #9CA3AF; margin-top: 24px; border-top: 1px solid #E5E7EB; padding-top: 12px;">
          This email does not contain a QR code. Entry is only allowed after on-spot payment is recorded and your pass is generated.
        </p>
      </div>
    `;

    await enqueueEmail({
      to: email,
      subject,
      html,
    });

    return NextResponse.json({
      success: true,
      registrationId: registrationRef.id,
      calculatedAmount,
    });
  } catch (error) {
    console.error('Registration create error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

