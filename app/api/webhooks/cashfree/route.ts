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
  const expected = crypto.createHmac('sha256', secret).update(signStr).digest('base64');
  return expected === signature;
}

export async function POST(req: Request) {
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const timestamp = req.headers.get('x-webhook-timestamp') ?? '';
  const signature = req.headers.get('x-webhook-signature') ?? '';
  const rawBody = await req.text();

  if (!timestamp || !signature || !rawBody) {
    return NextResponse.json({ error: 'Missing headers or body' }, { status: 400 });
  }

  if (!verifySignature(timestamp, rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: { type?: string; data?: { order?: { order_id?: string } } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (payload.type !== 'PAYMENT_SUCCESS_WEBHOOK') {
    return NextResponse.json({ ok: true });
  }

  const orderId = payload.data?.order?.order_id;
  if (!orderId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const firestore = getAdminFirestore();
    const snap = await firestore
      .collection('payments') // Was 'registrations'
      .where('cashfreeOrderId', '==', orderId)
      .limit(1)
      .get();

    if (snap.empty) {
      console.log(`Payment not found for orderId: ${orderId}`);
      return NextResponse.json({ ok: true });
    }

    const paymentDoc = snap.docs[0];
    const paymentData = paymentDoc.data();

    // Update payment status
    await paymentDoc.ref.update({
      status: 'success', // Was paymentStatus: 'PAID'
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Check if pass already exists (idempotency)
    const existingPassSnap = await firestore
      .collection('passes')
      .where('paymentId', '==', orderId)
      .limit(1)
      .get();

    if (!existingPassSnap.empty) {
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
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      } catch (err) {
        console.error('Webhook team fetch error', err);
      }
    }

    await passRef.set(passData);

    // Send Email with PDF attachment
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
        }).catch(err => console.error('Webhook email error', err));
      } catch (pdfErr) {
        console.error('PDF generation error, sending email without attachment', pdfErr);
        // Fallback: send email without PDF
        sendEmail({
          to: userData.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        }).catch(err => console.error('Webhook email error', err));
      }
    }
  } catch (e) {
    console.error('Cashfree webhook error', e);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

