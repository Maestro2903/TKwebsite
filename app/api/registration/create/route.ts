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

    // Email dispatch removed because Firebase Cloud Functions handles sending the OD mail on registration creation.

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

