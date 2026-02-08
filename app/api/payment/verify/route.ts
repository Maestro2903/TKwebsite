import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { sendEmail, emailTemplates } from '@/features/email/emailService';
import { getAdminFirestore } from '@/lib/firebase/adminApp';
import { createQRPayload } from '@/features/passes/qrService';
import { generatePassPDFBuffer } from '@/features/passes/pdfGenerator.server';

const CASHFREE_BASE =
  process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const appId =
      process.env.NEXT_PUBLIC_CASHFREE_APP_ID || process.env.CASHFREE_APP_ID;
    const secret = process.env.CASHFREE_SECRET_KEY;
    if (!appId || !secret) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    const response = await fetch(
      `${CASHFREE_BASE}/orders/${orderId}/payments`,
      {
        headers: {
          'x-client-id': appId,
          'x-client-secret': secret,
          'x-api-version': '2025-01-01',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 500 }
      );
    }

    const payments = await response.json();

    // Check if ANY payment for this order was successful
    const successfulPayment = Array.isArray(payments)
      ? payments.find((p: any) => p.payment_status === 'SUCCESS')
      : payments.payment_status === 'SUCCESS' ? payments : null;

    if (!successfulPayment) {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      );
    }

    const paymentsSnapshot = await db
      .collection('payments')
      .where('cashfreeOrderId', '==', orderId)
      .limit(1)
      .get();

    if (paymentsSnapshot.empty) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const paymentDoc = paymentsSnapshot.docs[0];
    const paymentData = paymentDoc.data();

    await paymentDoc.ref.update({ status: 'success' });

    // Idempotency check: return existing pass if already created
    const existingPassSnapshot = await db
      .collection('passes')
      .where('paymentId', '==', orderId)
      .limit(1)
      .get();

    if (!existingPassSnapshot.empty) {
      const existingPass = existingPassSnapshot.docs[0];
      const existingData = existingPass.data();
      return NextResponse.json({
        success: true,
        passId: existingPass.id,
        qrCode: existingData.qrCode,
        message: 'Pass already exists',
      });
    }


    const passRef = db.collection('passes').doc();

    // Create signed QR payload
    const qrData = createQRPayload(
      passRef.id,
      paymentData.userId as string,
      paymentData.passType as string
    );

    const qrCodeUrl: string = await QRCode.toDataURL(qrData);

    // Prepare base pass data
    const passData: any = {
      userId: paymentData.userId,
      passType: paymentData.passType,
      amount: paymentData.amount,
      paymentId: orderId,
      status: 'paid',
      qrCode: qrCodeUrl,
      createdAt: new Date(),
    };

    // For group events, fetch and snapshot team data
    if (paymentData.passType === 'group_events' && paymentData.teamId) {
      try {
        const teamDoc = await db.collection('teams').doc(paymentData.teamId).get();
        if (teamDoc.exists) {
          const teamData = teamDoc.data();

          // Create immutable snapshot of team at payment time
          passData.teamId = paymentData.teamId;
          passData.teamSnapshot = {
            teamName: teamData?.teamName || '',
            totalMembers: teamData?.members?.length || 0,
            members: (teamData?.members || []).map((member: any) => ({
              memberId: member.memberId,
              name: member.name,
              phone: member.phone,
              isLeader: member.isLeader,
              checkedIn: false, // Initially unchecked
            })),
          };

          // Update team document with passId reference
          await db.collection('teams').doc(paymentData.teamId).update({
            passId: passRef.id,
            updatedAt: new Date(),
          });
        }
      } catch (teamError) {
        console.error('Error fetching team data:', teamError);
        // Continue without team snapshot if fetch fails
      }
    }

    await passRef.set(passData);


    const userDoc = await db
      .collection('users')
      .doc(paymentData.userId as string)
      .get();
    const userData = userDoc.data();

    if (userData?.email) {
      const emailTemplate = emailTemplates.passConfirmation({
        name: userData.name ?? 'there',
        amount: paymentData.amount,
        passType: paymentData.passType,
        college: userData.college ?? '-',
        phone: userData.phone ?? '-',
        qrCodeUrl: qrCodeUrl,
      });

      // Generate PDF pass and send with attachment
      try {
        const pdfBuffer = await generatePassPDFBuffer({
          passType: paymentData.passType,
          amount: paymentData.amount,
          userName: userData.name ?? 'User',
          email: userData.email,
          phone: userData.phone ?? '-',
          college: userData.college ?? '-',
          qrCode: qrCodeUrl,
          teamName: passData.teamSnapshot?.teamName,
          members: passData.teamSnapshot?.members,
        });

        await sendEmail({
          to: userData.email as string,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          attachments: [
            {
              filename: `takshashila-pass-${paymentData.passType}.pdf`,
              content: pdfBuffer,
            },
          ],
        });
      } catch (pdfErr) {
        console.error('PDF generation error in verify, sending email without attachment', pdfErr);
        await sendEmail({
          to: userData.email as string,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
      }
    }

    return NextResponse.json({
      success: true,
      passId: passRef.id,
      qrCode: qrCodeUrl,
    });
  } catch (error: unknown) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
