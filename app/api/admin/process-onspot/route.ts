import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/adminApp';
import type { OnspotPayment, Registration } from '@/lib/db/firestoreTypes';
import { validateRegistrationInput } from '@/lib/validation/registration';
import { enqueueEmail } from '@/features/email/firestoreEmail';
import { decryptQRData, encryptQRData } from '@/lib/crypto/qrEncryption';

type ModeAInput = {
  registrationId: string;
  paymentMode: OnspotPayment['paymentMode'];
  amountCollected: number;
  notes?: string;
};

type ModeBInput = {
  manualEntry: true;
  name: string;
  email: string;
  phone: string;
  college: string;
  passType: Registration['passType'];
  selectedDays?: string[];
  selectedEvents: string[];
  teamMemberCount?: number | null;
  teamData?: Record<string, unknown>;
  paymentMode: OnspotPayment['paymentMode'];
  amountCollected: number;
  notes?: string;
};

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

    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists || !userDoc.data()?.isOrganizer) {
      return NextResponse.json(
        { error: 'Forbidden: Organizer access required' },
        { status: 403 }
      );
    }

    const body = (await req.json()) as ModeAInput | ModeBInput;

    const isManual = (body as ModeBInput).manualEntry === true;

    if (!isManual) {
      const input = body as ModeAInput;
      if (!input.registrationId) {
        return NextResponse.json({ error: 'registrationId is required' }, { status: 400 });
      }
      if (typeof input.amountCollected !== 'number' || input.amountCollected <= 0) {
        return NextResponse.json({ error: 'amountCollected must be positive' }, { status: 400 });
      }

      const registrationRef = db.collection('registrations').doc(input.registrationId);
      const registrationSnap = await registrationRef.get();

      if (!registrationSnap.exists) {
        return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
      }

      const registration = registrationSnap.data() as Registration;

      if (registration.status !== 'pending') {
        return NextResponse.json(
          { error: 'Only pending registrations can be converted' },
          { status: 400 }
        );
      }

      const result = await db.runTransaction(async (transaction) => {
        const freshSnap = await transaction.get(registrationRef);
        if (!freshSnap.exists) {
          throw new Error('Registration not found');
        }
        const freshRegistration = freshSnap.data() as Registration;
        if (freshRegistration.status !== 'pending') {
          throw new Error('Registration is no longer pending');
        }

        const onspotRef = db.collection('onspotPayments').doc();
        const onspotData: OnspotPayment = {
          registrationId: registrationRef.id,
          userId: freshRegistration.userId,
          amountCollected: input.amountCollected,
          paymentMode: input.paymentMode,
          collectedBy: decoded.uid,
          collectedAt: new Date(),
          notes: input.notes,
        };
        transaction.set(onspotRef, onspotData);

        const passRef = db.collection('passes').doc();

        const qrData = {
          id: passRef.id,
          name: freshRegistration.name,
          passType: freshRegistration.passType,
          events: freshRegistration.selectedEvents,
          days: freshRegistration.selectedDays,
        };
        const encrypted = encryptQRData(qrData);
        const qrCodeUrl = await QRCode.toDataURL(encrypted, {
          errorCorrectionLevel: 'H',
          width: 400,
        });

        const passData: any = {
          userId: freshRegistration.userId,
          passType: freshRegistration.passType,
          amount: input.amountCollected,
          paymentId: `onspot:${onspotRef.id}`,
          status: 'paid',
          qrCode: qrCodeUrl,
          createdAt: new Date(),
          selectedEvents: freshRegistration.selectedEvents,
          selectedDays: freshRegistration.selectedDays,
          eventAccess: {
            tech: false,
            nonTech: false,
            proshowDays: [],
            fullAccess: false,
          },
        };

        transaction.set(passRef, passData);

        transaction.update(registrationRef, {
          status: 'converted',
          convertedAt: new Date(),
          convertedToPassId: passRef.id,
        });

        return {
          onspotId: onspotRef.id,
          passId: passRef.id,
          qrCodeUrl,
          registration: freshRegistration,
        };
      });

      await enqueueEmail({
        to: result.registration.email,
        subject: 'Your official pass for CIT Takshashila 2026',
        html: `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
            <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 12px;">
              Your pass is ready
            </h1>
            <p style="font-size: 15px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
              Hi <strong>${result.registration.name}</strong>, your on-spot payment has been recorded and your official QR pass has been generated.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #4B5563; margin-bottom: 16px;">
              Show the attached QR code at the entry gates to access the venue.
            </p>
          </div>
        `,
      });

      return NextResponse.json({
        success: true,
        mode: 'convert',
        registrationId: input.registrationId,
        onspotPaymentId: result.onspotId,
        passId: result.passId,
      });
    }

    const manual = body as ModeBInput;

    if (
      !manual.name ||
      !manual.email ||
      !manual.phone ||
      !manual.college ||
      typeof manual.amountCollected !== 'number' ||
      manual.amountCollected <= 0
    ) {
      return NextResponse.json({ error: 'Missing or invalid manual entry fields' }, { status: 400 });
    }

    let calculatedAmount: number;
    try {
      const validationResult = await validateRegistrationInput({
        passType: manual.passType,
        selectedEvents: manual.selectedEvents,
        selectedDays: manual.selectedDays,
        teamMemberCount: manual.teamMemberCount,
      });
      calculatedAmount = validationResult.calculatedAmount;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid registration input';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const result = await db.runTransaction(async (transaction) => {
      const registrationRef = db.collection('registrations').doc();

      const registrationData: Registration = {
        userId: decoded.uid,
        name: manual.name,
        email: manual.email,
        phone: manual.phone,
        college: manual.college,
        passType: manual.passType,
        selectedEvents: manual.selectedEvents,
        selectedDays: manual.selectedDays ?? [],
        teamData: manual.teamData ?? undefined,
        calculatedAmount,
        status: 'converted',
        createdAt: new Date(),
        convertedAt: new Date(),
      };

      transaction.set(registrationRef, registrationData);

      const onspotRef = db.collection('onspotPayments').doc();
      const onspotData: OnspotPayment = {
        registrationId: registrationRef.id,
        userId: decoded.uid,
        amountCollected: manual.amountCollected,
        paymentMode: manual.paymentMode,
        collectedBy: decoded.uid,
        collectedAt: new Date(),
        notes: manual.notes,
      };
      transaction.set(onspotRef, onspotData);

      const passRef = db.collection('passes').doc();
      const qrData = {
        id: passRef.id,
        name: manual.name,
        passType: manual.passType,
        events: manual.selectedEvents,
        days: manual.selectedDays ?? [],
      };
      const encrypted = encryptQRData(qrData);
      const qrCodeUrl = await QRCode.toDataURL(encrypted, {
        errorCorrectionLevel: 'H',
        width: 400,
      });

      const passData: any = {
        userId: decoded.uid,
        passType: manual.passType,
        amount: manual.amountCollected,
        paymentId: `onspot:${onspotRef.id}`,
        status: 'paid',
        qrCode: qrCodeUrl,
        createdAt: new Date(),
        selectedEvents: manual.selectedEvents,
        selectedDays: manual.selectedDays ?? [],
        eventAccess: {
          tech: false,
          nonTech: false,
          proshowDays: [],
          fullAccess: false,
        },
      };

      transaction.set(passRef, passData);

      transaction.update(registrationRef, {
        convertedToPassId: passRef.id,
      });

      return {
        registrationId: registrationRef.id,
        onspotId: onspotRef.id,
        passId: passRef.id,
        registration: registrationData,
      };
    });

    await enqueueEmail({
      to: manual.email,
      subject: 'Your official pass for CIT Takshashila 2026',
      html: `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
          <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 12px;">
            Your pass is ready
          </h1>
          <p style="font-size: 15px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
            Hi <strong>${manual.name}</strong>, your on-spot payment has been recorded and your official QR pass has been generated.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #4B5563; margin-bottom: 16px;">
            Show the attached QR code at the entry gates to access the venue.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      mode: 'manual',
      registrationId: result.registrationId,
      onspotPaymentId: result.onspotId,
      passId: result.passId,
    });
  } catch (error) {
    console.error('Process onspot error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

