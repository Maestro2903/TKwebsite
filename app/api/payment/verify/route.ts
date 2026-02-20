import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { sendEmail, emailTemplates } from '@/features/email/emailService';
import { getAdminFirestore } from '@/lib/firebase/adminApp';
import { createQRPayload } from '@/features/passes/qrService';
import { generatePassPDFBuffer } from '@/features/passes/pdfGenerator.server';
import { checkRateLimit } from '@/lib/security/rateLimiter';

const CASHFREE_BASE =
  process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(req, { limit: 10, windowMs: 60000 });
  if (rateLimitResponse) return rateLimitResponse;

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


    // Poll Cashfree order status with retries (handles timing gap after redirect)
    const MAX_POLL_ATTEMPTS = 5;
    const POLL_DELAY_MS = 2000;
    let order: any = null;
    let lastResponse: Response | null = null;

    for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
      console.log(`[Verify] Step 3: Fetching order from Cashfree (attempt ${attempt}/${MAX_POLL_ATTEMPTS}): ${CASHFREE_BASE}/orders/${orderId}`);
      lastResponse = await fetch(`${CASHFREE_BASE}/orders/${orderId}`, {
        headers: {
          'x-client-id': appId,
          'x-client-secret': secret,
          'x-api-version': '2025-01-01',
        },
      });

      if (!lastResponse.ok) {
        const errorText = await lastResponse.text();
        console.error(`[Verify] ERROR: Cashfree API returned ${lastResponse.status}`, errorText);
        return NextResponse.json(
          { error: `Cashfree API error: ${lastResponse.status}`, details: errorText },
          { status: 500 }
        );
      }

      order = await lastResponse.json();
      console.log(`[Verify] Step 4: Cashfree order status: ${order.order_status}, Amount: ${order.order_amount} (attempt ${attempt})`);

      if (order.order_status === 'PAID') {
        console.log(`[Verify] ✅ Payment confirmed as PAID on attempt ${attempt}`);
        break;
      }

      if (attempt < MAX_POLL_ATTEMPTS) {
        console.log(`[Verify] Order not PAID yet (${order.order_status}), waiting ${POLL_DELAY_MS}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, POLL_DELAY_MS));
      }
    }

    if (order.order_status !== 'PAID') {
      console.warn(`[Verify] WARNING: Order still not paid after ${MAX_POLL_ATTEMPTS} attempts. Final status: ${order.order_status}`);
      return NextResponse.json(
        {
          success: false,
          error: `Payment status is ${order.order_status}. Please wait a moment and retry verification.`,
          status: order.order_status
        },
        { status: 400 }
      );
    }

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

    // Fetch event details for eventAccess computation (before transaction)
    console.log('[Verify] Step 8: Fetching selected events details...');
    const selectedEvents = paymentData.selectedEvents || [];
    let hasTechEvents = false;
    let hasNonTechEvents = false;

    if (selectedEvents.length > 0) {
      try {
        const eventDocs = await Promise.all(
          selectedEvents.map((eventId: string) => db.collection('events').doc(eventId).get())
        );

        const events = eventDocs
          .filter(doc => doc.exists)
          .map(doc => doc.data());

        hasTechEvents = events.some(e => e?.category === 'technical');
        hasNonTechEvents = events.some(e => e?.category === 'non_technical');

        console.log(`[Verify] Event access computed: tech=${hasTechEvents}, nonTech=${hasNonTechEvents}`);
      } catch (eventError) {
        console.error('[Verify] Error fetching events:', eventError);
        // Continue without event access data if fetch fails
      }
    }

    // Use Firestore transaction to prevent race condition with webhook
    console.log('[Verify] Step 9: Starting transaction to create pass...');
    const result = await db.runTransaction(async (transaction) => {
      // 1. Query for existing pass inside transaction
      const existingPassQuery = db.collection('passes')
        .where('paymentId', '==', orderId)
        .limit(1);
      const existingPassSnapshot = await transaction.get(existingPassQuery);

      if (!existingPassSnapshot.empty) {
        // Pass already exists - return it
        const existingPass = existingPassSnapshot.docs[0];
        console.log(`[Verify] ℹ️ Pass already exists: ${existingPass.id} (transaction check)`);
        return {
          created: false,
          passId: existingPass.id,
          qrCode: existingPass.data().qrCode
        };
      }

      console.log('[Verify] No existing pass found, creating new pass in transaction...');

      // 2. Fetch user data for QR code
      const userDocRef = db.collection('users').doc(paymentData.userId as string);
      const userDoc = await transaction.get(userDocRef);
      const userData = userDoc.exists ? userDoc.data() : null;

      // 3. Create pass document inside transaction
      const passRef = db.collection('passes').doc();

      // Import encryption utility
      const { encryptQRData } = await import('@/lib/crypto/qrEncryption');

      // Prepare QR data based on pass type
      let qrData: any;

      if (paymentData.passType === 'group_events' && paymentData.teamId) {
        // For group events, fetch team data first
        const teamDocRef = db.collection('teams').doc(paymentData.teamId);
        const teamDoc = await transaction.get(teamDocRef);
        const teamData = teamDoc.exists ? teamDoc.data() : null;

        if (teamData) {
          // Group event - include all team member names
          qrData = {
            id: passRef.id,
            passType: paymentData.passType,
            teamName: teamData.teamName || '',
            members: (teamData.members || []).map((m: any) => ({
              name: m.name,
              isLeader: m.isLeader
            })),
            events: selectedEvents,
            days: paymentData.selectedDays || []
          };
        } else {
          // Fallback if team not found
          qrData = {
            id: passRef.id,
            name: userData?.name || 'Unknown',
            passType: paymentData.passType,
            events: selectedEvents,
            days: paymentData.selectedDays || []
          };
        }
      } else {
        // Individual pass - include user name
        qrData = {
          id: passRef.id,
          name: userData?.name || 'Unknown',
          passType: paymentData.passType,
          events: selectedEvents,
          days: paymentData.selectedDays || []
        };
      }

      // Encrypt QR data
      const encryptedData = encryptQRData(qrData);
      const qrCodeUrl: string = await QRCode.toDataURL(encryptedData, {
        errorCorrectionLevel: 'H', // High error correction for better scanning
        width: 400
      });


      // Prepare base pass data
      const passData: any = {
        userId: paymentData.userId,
        passType: paymentData.passType,
        amount: paymentData.amount,
        paymentId: orderId,
        status: 'paid',
        qrCode: qrCodeUrl,
        createdAt: new Date(),
        // Event selection fields
        selectedEvents: selectedEvents,
        selectedDays: paymentData.selectedDays || [],
        eventAccess: {
          tech: hasTechEvents,
          nonTech: hasNonTechEvents,
          proshowDays: paymentData.passType === 'proshow' ? ['2026-02-26', '2026-02-28'] : [],
          fullAccess: paymentData.passType === 'sana_concert',
        },
      };

      // For group events, fetch and snapshot team data
      if (paymentData.passType === 'group_events' && paymentData.teamId) {
        try {
          const teamDocRef = db.collection('teams').doc(paymentData.teamId);
          const teamDoc = await transaction.get(teamDocRef);
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

            // Update team document with passId reference and success status inside transaction
            transaction.update(teamDocRef, {
              passId: passRef.id,
              paymentStatus: 'success',
              updatedAt: new Date(),
            });
            console.log(`[Verify] Scheduled team ${paymentData.teamId} update in transaction`);
          }
        } catch (teamError) {
          console.error('[Verify] Error fetching team data:', teamError);
          // Continue without team snapshot if fetch fails
        }
      }

      // Create pass inside transaction
      transaction.set(passRef, passData);
      console.log(`[Verify] Scheduled pass creation in transaction: ${passRef.id}`);

      return { created: true, passId: passRef.id, qrCode: qrCodeUrl };
    });

    console.log(`[Verify] ✅ Transaction completed. Pass created: ${result.created}`);


    // Send email ONLY if pass was newly created
    if (result.created) {
      console.log('[Verify] Step 10: Sending confirmation email (new pass)...');
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
          qrCodeUrl: result.qrCode,
        });

        // Generate PDF pass and send with attachment
        try {
          // Fetch pass data for PDF (since we need teamSnapshot if it exists)
          const passDoc = await db.collection('passes').doc(result.passId).get();
          const finalPassData = passDoc.data();

          const pdfBuffer = await generatePassPDFBuffer({
            passType: paymentData.passType,
            amount: paymentData.amount,
            userName: userData.name ?? 'User',
            email: userData.email,
            phone: userData.phone ?? '-',
            college: userData.college ?? '-',
            qrCode: result.qrCode,
            teamName: finalPassData?.teamSnapshot?.teamName,
            members: finalPassData?.teamSnapshot?.members,
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
          console.log('[Verify] ✅ Email sent successfully');
        } catch (pdfErr) {
          console.error('PDF generation error in verify, sending email without attachment', pdfErr);
          await sendEmail({
            to: userData.email as string,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });
        }
      }
    } else {
      console.log('[Verify] Skipping email (pass already existed)');
    }

    const duration = Date.now() - startTime;
    console.log(`[Verify] ========== Verification complete successfully (${duration}ms) ==========`);

    return NextResponse.json({
      success: true,
      passId: result.passId,
      qrCode: result.qrCode,
      message: result.created ? undefined : 'Pass already exists',
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
