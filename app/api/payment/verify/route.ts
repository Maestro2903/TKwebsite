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
  const startTime = Date.now();
  try {
    const { orderId } = await req.json();
    console.log(`[Verify] ========== Starting verification for orderId: ${orderId} ==========`);
    console.log(`[Verify] Environment: ${process.env.NEXT_PUBLIC_CASHFREE_ENV || 'not set'}`);
    if (!orderId || typeof orderId !== 'string') {
      console.error('[Verify] ERROR: Missing or invalid orderId');
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const db = getAdminFirestore();
    console.log('[Verify] Step 1: Firestore connection established');

    const appId =
      process.env.NEXT_PUBLIC_CASHFREE_APP_ID || process.env.CASHFREE_APP_ID;
    const secret = process.env.CASHFREE_SECRET_KEY;
    if (!appId || !secret) {
      console.error('[Verify] ERROR: Missing Cashfree credentials', { hasAppId: !!appId, hasSecret: !!secret });
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }
    console.log(`[Verify] Step 2: Cashfree credentials found (appId: ${appId?.substring(0, 8)}...)`);


    console.log(`[Verify] Step 3: Fetching order from Cashfree: ${CASHFREE_BASE}/orders/${orderId}`);
    const response = await fetch(`${CASHFREE_BASE}/orders/${orderId}`, {
      headers: {
        'x-client-id': appId,
        'x-client-secret': secret,
        'x-api-version': '2025-01-01',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Verify] ERROR: Cashfree API returned ${response.status}`, errorText);
      return NextResponse.json(
        { error: `Cashfree API error: ${response.status}`, details: errorText },
        { status: 500 }
      );
    }

    const order = await response.json();
    console.log(`[Verify] Step 4: Cashfree order retrieved. Status: ${order.order_status}, Amount: ${order.order_amount}`);

    if (order.order_status !== 'PAID') {
      console.warn(`[Verify] WARNING: Order not paid. Current status: ${order.order_status}`);
      return NextResponse.json(
        {
          success: false,
          error: `Payment status is ${order.order_status}. Please complete payment in the Cashfree window.`,
          status: order.order_status
        },
        { status: 400 }
      );
    }
    console.log('[Verify] ✅ Payment confirmed as PAID in Cashfree');

    let paymentsSnapshot;
    let paymentDoc;
    let paymentData;

    // Retry loop for Firestore propagation
    console.log('[Verify] Step 5: Looking up payment record in Firestore...');
    for (let i = 0; i < 3; i++) {
      paymentsSnapshot = await db
        .collection('payments')
        .where('cashfreeOrderId', '==', orderId)
        .limit(1)
        .get();

      if (!paymentsSnapshot.empty) {
        console.log(`[Verify] ✅ Payment record found on attempt ${i + 1}`);
        break;
      }
      console.warn(`[Verify] Attempt ${i + 1}/3 - Record not found. ${i < 2 ? 'Retrying in 1s...' : 'Final attempt failed'}`);
      if (i < 2) await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!paymentsSnapshot || paymentsSnapshot.empty) {
      console.error(`[Verify] ERROR: Payment record not found in Firestore after 3 attempts for orderId: ${orderId}`);
      return NextResponse.json({
        error: 'Payment record not found in database. Please contact support if payment was deducted.',
        details: 'Firestore lookup failed after 3 retries',
        orderId
      }, { status: 404 });
    }

    paymentDoc = paymentsSnapshot.docs[0];
    paymentData = paymentDoc.data();
    console.log(`[Verify] Step 6: Payment record details:`, {
      userId: paymentData.userId,
      currentStatus: paymentData.status,
      amount: paymentData.amount,
      passType: paymentData.passType
    });

    console.log('[Verify] Step 7: Updating payment status to success...');
    await paymentDoc.ref.update({
      status: 'success',
      updatedAt: new Date()
    });
    console.log('[Verify] ✅ Payment status updated to success in Firestore');

    // Idempotency check: return existing pass if already created
    console.log('[Verify] Step 8: Checking for existing pass...');
    const existingPassSnapshot = await db
      .collection('passes')
      .where('paymentId', '==', orderId)
      .limit(1)
      .get();

    if (!existingPassSnapshot.empty) {
      const existingPass = existingPassSnapshot.docs[0];
      const existingData = existingPass.data();
      console.log(`[Verify] ℹ️ Pass already exists: ${existingPass.id} (idempotency check)`);
      const duration = Date.now() - startTime;
      console.log(`[Verify] ========== Verification complete (${duration}ms) - Existing pass returned ==========`);
      return NextResponse.json({
        success: true,
        passId: existingPass.id,
        qrCode: existingData.qrCode,
        message: 'Pass already exists',
      });
    }
    console.log('[Verify] No existing pass found, creating new pass...');


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

          // Update team document with passId reference and success status
          await db.collection('teams').doc(paymentData.teamId).update({
            passId: passRef.id,
            paymentStatus: 'success',
            updatedAt: new Date(),
          });
          console.log(`[Verify] Updated team ${paymentData.teamId} status to success`);
        }
      } catch (teamError) {
        console.error('Error fetching team data:', teamError);
        // Continue without team snapshot if fetch fails
      }
    }

    console.log('[Verify] Step 10: Creating pass document in Firestore...');
    await passRef.set(passData);
    console.log(`[Verify] ✅ Pass created successfully: ${passRef.id}`);


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

    const duration = Date.now() - startTime;
    console.log(`[Verify] ========== Verification complete successfully (${duration}ms) ==========`);

    return NextResponse.json({
      success: true,
      passId: passRef.id,
      qrCode: qrCodeUrl,
    });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    console.error(`[Verify] ========== FATAL ERROR after ${duration}ms ==========`);
    console.error('[Verify] Error details:', error);
    if (error instanceof Error) {
      console.error('[Verify] Stack trace:', error.stack);
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Server error',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
