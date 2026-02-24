import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/adminApp';
import { FieldValue } from 'firebase-admin/firestore';
import { validateRegistrationInput } from '@/lib/validation/registration';
import type { Registration } from '@/lib/db/firestoreTypes';

export async function PUT(req: NextRequest) {
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
      registrationId,
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

    if (!registrationId || typeof registrationId !== 'string') {
      return NextResponse.json({ error: 'registrationId is required' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const registrationRef = db.collection('registrations').doc(registrationId);
    const registrationSnap = await registrationRef.get();

    if (!registrationSnap.exists) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    const registration = registrationSnap.data() as Registration;

    if (registration.userId !== decoded.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (registration.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending registrations can be edited' },
        { status: 400 }
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

    // --- Handle team document for group_events ---
    let teamId: string | undefined;

    if (passType === 'group_events' && teamData) {
      const teamMembers = (teamData.members ?? []).map((m: any, i: number) => ({
        memberId: `member_${i}`,
        name: m.name?.trim() ?? '',
        phone: m.phone?.trim() ?? '',
        email: m.email?.trim() ?? '',
        isLeader: false,
        attendance: { checkedIn: false, checkInTime: null, checkedInBy: null },
      }));

      teamMembers.unshift({
        memberId: decoded.uid,
        name: teamData.leader?.name ?? name,
        phone: teamData.leader?.phone ?? phone,
        email: email ?? '',
        isLeader: true,
        attendance: { checkedIn: false, checkInTime: null, checkedInBy: null },
      });

      // Reuse existing team doc if available
      if (registration.teamId) {
        teamId = registration.teamId;
        await db.collection('teams').doc(teamId).update({
          teamName: teamData.teamName?.trim() || name,
          leaderId: decoded.uid,
          totalMembers: teamMembers.length,
          totalAmount: calculatedAmount,
          members: teamMembers,
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        const teamRef = db.collection('teams').doc();
        teamId = teamRef.id;
        await teamRef.set({
          teamName: teamData.teamName?.trim() || name,
          leaderId: decoded.uid,
          passId: '',
          totalMembers: teamMembers.length,
          totalAmount: calculatedAmount,
          members: teamMembers,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    const updatePayload: Record<string, any> = {
      passType,
      selectedEvents,
      selectedDays: selectedDays ?? [],
      calculatedAmount,
      updatedAt: new Date(),
    };

    if (typeof name === 'string') updatePayload.name = name;
    if (typeof email === 'string') updatePayload.email = email;
    if (typeof phone === 'string') updatePayload.phone = phone;
    if (typeof college === 'string') updatePayload.college = college;

    // Handle teamData + teamId fields
    if (teamData != null) {
      updatePayload.teamData = teamData;
    } else if (registration.teamData) {
      updatePayload.teamData = FieldValue.delete();
    }

    if (teamId) {
      updatePayload.teamId = teamId;
    } else if (registration.teamId) {
      updatePayload.teamId = FieldValue.delete();
    }

    await registrationRef.update(updatePayload);

    const updatedSnap = await registrationRef.get();
    const updatedData = updatedSnap.data() as Registration;

    return NextResponse.json({
      success: true,
      registrationId,
      registration: updatedData,
      ...(teamId ? { teamId } : {}),
    });
  } catch (error) {
    console.error('Registration update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}