import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/adminApp';
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

    const update: Partial<Registration> = {
      passType,
      selectedEvents,
      selectedDays: selectedDays ?? [],
      teamData: teamData ?? undefined,
      calculatedAmount,
      updatedAt: new Date(),
    };

    if (typeof name === 'string') update.name = name;
    if (typeof email === 'string') update.email = email;
    if (typeof phone === 'string') update.phone = phone;
    if (typeof college === 'string') update.college = college;

    await registrationRef.update(update);

    const updatedSnap = await registrationRef.get();
    const updatedData = updatedSnap.data() as Registration;

    return NextResponse.json({
      success: true,
      registrationId,
      registration: updatedData,
    });
  } catch (error) {
    console.error('Registration update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

