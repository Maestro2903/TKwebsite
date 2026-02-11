import * as admin from 'firebase-admin';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/adminApp';
import QRCode from 'qrcode';
import { createQRPayload } from '@/features/passes/qrService';
import { sendEmail, emailTemplates } from '@/features/email/emailService';
import { generatePassPDFBuffer } from '@/features/passes/pdfGenerator.server';

/**
 * Verify Cashfree webhook signature per docs:
 * https://www.cashfree.com/docs/payments/online/webhooks/signature-verification
 * signedPayload = timestamp + rawBody (or optionally timestamp + "." + rawBody per some docs)
 * expectedSignature = Base64(HMAC-SHA256(signedPayload, secret))
 * Cashfree may sign with Webhook Secret (Dashboard) or PG/API secret (client secret).
 */
function verifySignature(
  timestamp: string,
  rawBody: string,
  signature: string,
  secret: string,
  useDotSeparator = false
): boolean {
  const signedPayload = useDotSeparator ? `${timestamp}.${rawBody}` : timestamp + rawBody;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('base64');
  return expectedSignature === signature;
}

export async function POST(req: Request) {
  const startTime = Date.now();
  console.log('[Webhook] ========== Webhook received ==========');

  const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET_KEY;
  const apiSecret = process.env.CASHFREE_SECRET_KEY;
  if (!webhookSecret && !apiSecret) {
    console.error(
      '[Webhook] ERROR: Set at least one of CASHFREE_WEBHOOK_SECRET_KEY or CASHFREE_SECRET_KEY in Vercel and .env.local.'
    );
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const timestamp = req.headers.get('x-webhook-timestamp') ?? '';
  const signature = req.headers.get('x-webhook-signature') ?? '';
  // Read raw body (use req.text() to match common runtimes; compare with Cashfree Logs payload for debugging).
  const rawBody = await req.text();

  // Safe diagnostics: timestamp value and body fingerprint for comparing with Cashfree Dashboard → Logs (no body/signature logged).
  const bodyFingerprint = rawBody
    ? crypto.createHash('sha256').update(rawBody, 'utf8').digest('hex').substring(0, 16)
    : 'empty';
  console.log(
    `[Webhook] Headers - Timestamp: ${timestamp ? `${timestamp}` : 'MISSING'}, Signature: ${signature ? 'present' : 'MISSING'}, Body: ${rawBody.length} bytes, bodySha256Prefix: ${bodyFingerprint}`
  );

  if (!timestamp || !signature || !rawBody) {
    console.error('[Webhook] ERROR: Missing required headers or body');
    return NextResponse.json({ error: 'Missing headers or body' }, { status: 400 });
  }

  // Try webhook secret first, then API secret (Cashfree docs say "PG secret key" / "client secret"). Optionally try dot-separator format.
  let verifiedWith: 'webhook_secret' | 'api_secret' | null = null;
  let usedDotFormat = false;

  if (webhookSecret && verifySignature(timestamp, rawBody, signature, webhookSecret)) {
    verifiedWith = 'webhook_secret';
  }
  if (!verifiedWith && apiSecret && verifySignature(timestamp, rawBody, signature, apiSecret)) {
    verifiedWith = 'api_secret';
  }
  if (!verifiedWith && webhookSecret && verifySignature(timestamp, rawBody, signature, webhookSecret, true)) {
    verifiedWith = 'webhook_secret';
    usedDotFormat = true;
  }
  if (!verifiedWith && apiSecret && verifySignature(timestamp, rawBody, signature, apiSecret, true)) {
    verifiedWith = 'api_secret';
    usedDotFormat = true;
  }

  if (!verifiedWith) {
    console.error('[Webhook] ERROR: Signature verification failed');
    console.error(
      '[Webhook] Tried all 4 combinations (all failed): webhook_secret no-dot, api_secret no-dot, webhook_secret dot, api_secret dot. Compare timestamp and bodySha256Prefix above with Cashfree Dashboard → Logs for this request.'
    );
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  console.log(`[Webhook] ✅ Signature verified (${verifiedWith}${usedDotFormat ? ', dot format' : ''})`);

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

    // Use Firestore transaction to prevent race condition with verify endpoint
    console.log('[Webhook] Step 5: Starting transaction to create pass...');
    const result = await firestore.runTransaction(async (transaction) => {
      // 1. Query for existing pass inside transaction
      const existingPassQuery = firestore.collection('passes')
        .where('paymentId', '==', orderId)
        .limit(1);
      const existingPassSnapshot = await transaction.get(existingPassQuery);
      
      if (!existingPassSnapshot.empty) {
        // Pass already exists - return it
        console.log(`[Webhook] ℹ️ Pass already exists: ${existingPassSnapshot.docs[0].id} (transaction check)`);
        return {
          created: false,
          passId: existingPassSnapshot.docs[0].id
        };
      }
      
      console.log('[Webhook] No existing pass found, creating new pass in transaction...');
      
      // 2. Create pass inside transaction
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
          const teamDocRef = firestore.collection('teams').doc(paymentData.teamId);
          const teamDoc = await transaction.get(teamDocRef);
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
            
            // Update team inside transaction
            transaction.update(teamDocRef, {
              passId: passRef.id,
              paymentStatus: 'success',
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`[Webhook] Scheduled team ${paymentData.teamId} update in transaction`);
          }
        } catch (err) {
          console.error('[Webhook] Webhook team fetch error', err);
        }
      }

      // Create pass inside transaction
      transaction.set(passRef, passData);
      console.log(`[Webhook] Scheduled pass creation in transaction: ${passRef.id}`);
      
      return { created: true, passId: passRef.id, qrCode: qrCodeUrl };
    });

    console.log(`[Webhook] ✅ Transaction completed. Pass created: ${result.created}`);

    // Send email ONLY if pass was newly created
    if (result.created) {
      console.log('[Webhook] Step 6: Sending confirmation email (new pass)...');
      const userDoc = await firestore.collection('users').doc(paymentData.userId).get();
      const userData = userDoc.data();
      if (userData?.email) {
        const emailTemplate = emailTemplates.passConfirmation({
          name: userData.name ?? 'there',
          amount: paymentData.amount,
          passType: paymentData.passType,
          college: userData.college ?? '-',
          phone: userData.phone ?? '-',
          qrCodeUrl: result.qrCode || '',
        });

        // Generate PDF pass
        try {
          // Fetch pass data for PDF (since we need teamSnapshot if it exists)
          const passDoc = await firestore.collection('passes').doc(result.passId).get();
          const finalPassData = passDoc.data();

          const pdfBuffer = await generatePassPDFBuffer({
            passType: paymentData.passType,
            amount: paymentData.amount,
            userName: userData.name ?? 'User',
            email: userData.email,
            phone: userData.phone ?? '-',
            college: userData.college ?? '-',
            qrCode: result.qrCode || '',
            teamName: finalPassData?.teamSnapshot?.teamName,
            members: finalPassData?.teamSnapshot?.members,
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
    } else {
      console.log('[Webhook] Skipping email (pass already existed)');
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

