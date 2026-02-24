import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/adminApp';
import { FieldValue } from 'firebase-admin/firestore';
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

    // Check for ANY existing pending registration by this user (regardless of passType)
    const existingPendingSnap = await db
      .collection('registrations')
      .where('userId', '==', decoded.uid)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

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

    // --- Handle team document for group_events ---
    let teamId: string | undefined;

    if (passType === 'group_events' && teamData) {
      // Build members array for the teams collection
      const teamMembers = (teamData.members ?? []).map((m: any, i: number) => ({
        memberId: `member_${i}`,
        name: m.name?.trim() ?? '',
        phone: m.phone?.trim() ?? '',
        email: m.email?.trim() ?? '',
        isLeader: false,
        attendance: { checkedIn: false, checkInTime: null, checkedInBy: null },
      }));

      // Add leader as first member
      teamMembers.unshift({
        memberId: decoded.uid,
        name: teamData.leader?.name ?? name,
        phone: teamData.leader?.phone ?? phone,
        email: email,
        isLeader: true,
        attendance: { checkedIn: false, checkInTime: null, checkedInBy: null },
      });

      // Check if existing registration already has a teamId — update the same team doc
      if (!existingPendingSnap.empty) {
        const prevData = existingPendingSnap.docs[0].data() as Registration;
        if (prevData.teamId) {
          teamId = prevData.teamId;
          await db.collection('teams').doc(teamId).update({
            teamName: teamData.teamName?.trim() || name,
            leaderId: decoded.uid,
            totalMembers: teamMembers.length,
            totalAmount: calculatedAmount,
            members: teamMembers,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }

      // No existing team — create a new one
      if (!teamId) {
        const teamRef = db.collection('teams').doc();
        teamId = teamRef.id;
        await teamRef.set({
          teamName: teamData.teamName?.trim() || name,
          leaderId: decoded.uid,
          passId: '', // will be populated when pass is created after payment
          totalMembers: teamMembers.length,
          totalAmount: calculatedAmount,
          members: teamMembers,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    let registrationId: string;
    let isUpdate = false;

    if (!existingPendingSnap.empty) {
      // --- Upsert: update the existing pending registration ---
      const existingDoc = existingPendingSnap.docs[0];
      registrationId = existingDoc.id;
      isUpdate = true;
      const prevData = existingDoc.data() as Registration;

      // Build the update payload
      const updatePayload: Record<string, any> = {
        passType,
        selectedEvents,
        selectedDays: selectedDays ?? [],
        calculatedAmount,
        updatedAt: new Date(),
        name,
        email,
        phone,
        college,
      };

      // Handle teamData + teamId fields
      if (teamData != null) {
        updatePayload.teamData = teamData;
      } else if (prevData.teamData) {
        // Switching away from group_events — remove teamData field
        updatePayload.teamData = FieldValue.delete();
      }

      if (teamId) {
        updatePayload.teamId = teamId;
      } else if (prevData.teamId) {
        // Switching away from group_events — remove teamId field
        updatePayload.teamId = FieldValue.delete();
      }

      await db.collection('registrations').doc(registrationId).update(updatePayload);
    } else {
      // --- No existing pending registration — create a new one ---
      const registrationRef = db.collection('registrations').doc();
      registrationId = registrationRef.id;

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
        ...(teamId ? { teamId } : {}),
        orderId: null,
        calculatedAmount,
        status: 'pending',
        createdAt: new Date(),
      };

      await registrationRef.set(registrationData);
    }

    const subject = isUpdate
      ? 'Registration updated – payment pending'
      : 'Registration received – payment pending';
    const html = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
        <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 12px;">
          ${isUpdate ? 'Registration Updated' : 'Thanks for registering for CIT Takshashila 2026'}
        </h1>
        <p style="font-size: 15px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
          Hi <strong>${name}</strong>, ${isUpdate ? 'your registration has been updated' : 'we&apos;ve received your registration'}. Your payment is still pending.
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
      registrationId,
      calculatedAmount,
      updated: isUpdate,
      ...(teamId ? { teamId } : {}),
    });
  } catch (error) {
    console.error('Registration create error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

