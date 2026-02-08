import * as admin from 'firebase-admin';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/adminApp';
import QRCode from 'qrcode';
import { createQRPayload } from '@/features/passes/qrService';
import { sendEmail, emailTemplates } from '@/features/email/emailService';
import { generatePassPDFBuffer } from '@/features/passes/pdfGenerator.server';

function verifySignature(timestamp: string, rawBody: string, signature: string, secret: string): boolean {
  const signStr = timestamp + rawBody;
  const expectedBase64 = crypto.createHmac('sha256', secret).update(signStr).digest('base64');
  const expectedHex = crypto.createHmac('sha256', secret).update(signStr).digest('hex');

  const matches = expectedBase64 === signature || expectedHex === signature;
  if (!matches) {
    console.log(`[Webhook] Signature mismatch. Received: ${signature.substring(0, 10)}...`);
  }
  return matches;
}

export async function POST(req: Request) {
  const startTime = Date.now();
  console.log('[Webhook] ========== Webhook received ==========');

  const secret = process.env.CASHFREE_WEBHOOK_SECRET_KEY || process.env.CASHFREE_SECRET_KEY;
  if (!secret) {
    console.error('[Webhook] ERROR: Missing webhook secret key');
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const timestamp = req.headers.get('x-webhook-timestamp') ?? '';
  const signature = req.headers.get('x-webhook-signature') ?? '';
  const rawBody = await req.text();
  console.log(`[Webhook] Headers received - Timestamp: ${timestamp ? 'present' : 'MISSING'}, Signature: ${signature ? 'present' : 'MISSING'}`);
  console.log(`[Webhook] Body length: ${rawBody.length} bytes`);

  if (!timestamp || !signature || !rawBody) {
    console.error('[Webhook] ERROR: Missing required headers or body');
    return NextResponse.json({ error: 'Missing headers or body' }, { status: 400 });
  }

  if (!verifySignature(timestamp, rawBody, signature, secret)) {
    console.error('[Webhook] ERROR: Signature verification failed');
    console.error('[Webhook] This usually means the webhook secret is incorrect or the payload was tampered with');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  console.log('[Webhook] ✅ Signature verified successfully');

  let payload: { type?: string; data?: { order?: { order_id?: string } } };
  try {
    payload = JSON.parse(rawBody);
    console.log(`[Webhook] Parsed payload - Type: ${payload.type || 'unknown'}`);
  } catch (parseError) {
    console.error('[Webhook] ERROR: Failed to parse JSON body', parseError);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (payload.type !== 'PAYMENT_SUCCESS_WEBHOOK') {
    console.log(`[Webhook] Ignoring non-success webhook type: ${payload.type}`);
    return NextResponse.json({ ok: true });
  }

  const orderId = payload.data?.order?.order_id;
  if (!orderId) {
    console.error('[Webhook] ERROR: Missing order_id in payload');
    return NextResponse.json({ ok: true });
  }
  console.log(`[Webhook] Processing PAYMENT_SUCCESS for order: ${orderId}`);

  try {
    const firestore = getAdminFirestore();
    console.log('[Webhook] Step 1: Firestore connection established');

    console.log('[Webhook] Step 2: Looking up payment record...');
    const snap = await firestore
      .collection('payments') // Was 'registrations'
      .where('cashfreeOrderId', '==', orderId)
      .limit(1)
      .get();

    if (snap.empty) {
      console.warn(`[Webhook] WARNING: Payment not found in Firestore for orderId: ${orderId}`);
      console.warn('[Webhook] This might be normal if the webhook arrived before create-order completed');
      return NextResponse.json({ ok: true });
    }

    const paymentDoc = snap.docs[0];
    const paymentData = paymentDoc.data();
    console.log(`[Webhook] Step 3: Found payment - User: ${paymentData.userId}, Status: ${paymentData.status}, Type: ${paymentData.passType}`);

    // Update payment status
    console.log('[Webhook] Step 4: Updating payment status to success...');
    await paymentDoc.ref.update({
      status: 'success', // Was paymentStatus: 'PAID'
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('[Webhook] ✅ Payment status updated');

    // Check if pass already exists (idempotency)
    console.log('[Webhook] Step 5: Checking for existing pass...');
    const existingPassSnap = await firestore
      .collection('passes')
      .where('paymentId', '==', orderId)
      .limit(1)
      .get();

    if (!existingPassSnap.empty) {
      console.log(`[Webhook] ℹ️ Pass already exists (idempotency): ${existingPassSnap.docs[0].id}`);
      const duration = Date.now() - startTime;
      console.log(`[Webhook] ========== Webhook processed (${duration}ms) - Pass exists ==========`);
      return NextResponse.json({ ok: true });
    }

    // Create Pass
    const passRef = firestore.collection('passes').doc();
    const qrData = createQRPayload(
      passRef.id,
      paymentData.userId,
      paymentData.passType
    );
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    const passData: any = {
      userId: paymentData.userId,
      passType: paymentData.passType,
      amount: paymentData.amount,
      paymentId: orderId,
      status: 'paid',
      qrCode: qrCodeUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Group event logic
    if (paymentData.passType === 'group_events' && paymentData.teamId) {
      try {
        const teamDoc = await firestore.collection('teams').doc(paymentData.teamId).get();
        if (teamDoc.exists) {
          const teamData = teamDoc.data();
          passData.teamId = paymentData.teamId;
          passData.teamSnapshot = {
            teamName: teamData?.teamName || '',
            totalMembers: teamData?.members?.length || 0,
            members: (teamData?.members || []).map((member: any) => ({
              memberId: member.memberId,
              name: member.name,
              phone: member.phone,
              isLeader: member.isLeader,
              checkedIn: false,
            })),
          };
          await firestore.collection('teams').doc(paymentData.teamId).update({
            passId: passRef.id,
            paymentStatus: 'success',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      } catch (err) {
        console.error('Webhook team fetch error', err);
      }
    }

    await passRef.set(passData);
    console.log(`[Webhook] ✅ Pass created: ${passRef.id}`);

    // Send Email with PDF attachment
    console.log('[Webhook] Step 7: Sending confirmation email...');
    const userDoc = await firestore.collection('users').doc(paymentData.userId).get();
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

      // Generate PDF pass
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

        // Send email with PDF attachment
        sendEmail({
          to: userData.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          attachments: [
            {
              filename: `takshashila-pass-${paymentData.passType}.pdf`,
              content: pdfBuffer,
            },
          ],
        }).catch(err => {
          console.error('[Webhook] Email send error:', err);
        });
        console.log('[Webhook] ✅ Email sent with PDF attachment');
      } catch (pdfErr) {
        console.error('[Webhook] PDF generation error, sending email without attachment:', pdfErr);
        // Fallback: send email without PDF
        sendEmail({
          to: userData.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        }).catch(err => {
          console.error('[Webhook] Email send error (fallback):', err);
        });
        console.log('[Webhook] ✅ Email sent without PDF');
      }
    } else {
      console.warn('[Webhook] WARNING: User email not found, skipping email');
    }
    const duration = Date.now() - startTime;
    console.log(`[Webhook] ========== Webhook processed successfully (${duration}ms) ==========`);
  } catch (e) {
    const duration = Date.now() - startTime;
    console.error(`[Webhook] ========== FATAL ERROR after ${duration}ms ==========`);
    console.error('[Webhook] Error details:', e);
    if (e instanceof Error) {
      console.error('[Webhook] Stack trace:', e.stack);
    }
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

