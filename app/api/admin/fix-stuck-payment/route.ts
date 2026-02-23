/**
 * POST /api/admin/fix-stuck-payment
 * Admin-only recovery for stuck payments: payment exists (and may be success) but no pass was created.
 * Creates the pass and sends confirmation email. Protect this route at infrastructure level (e.g. IP allowlist).
 */

import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { sendEmail, emailTemplates } from '@/features/email/emailService';
import { getAdminFirestore } from '@/lib/firebase/adminApp';
import { generatePassPDFBuffer } from '@/features/passes/pdfGenerator.server';
import { getCachedEventsByIds } from '@/lib/cache/eventsCache';

const CASHFREE_BASE =
  process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : null;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid orderId. Send { "orderId": "order_..." }' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // 1. Find payment: by doc id or by cashfreeOrderId
    let paymentDoc = await db.collection('payments').doc(orderId).get();
    if (!paymentDoc.exists) {
      const snap = await db.collection('payments').where('cashfreeOrderId', '==', orderId).limit(1).get();
      if (!snap.empty) paymentDoc = snap.docs[0];
    }
    if (!paymentDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Payment not found', orderId },
        { status: 404 }
      );
    }

    const rawData = paymentDoc.data() as Record<string, unknown>;
    if (!rawData.userId || !rawData.passType || typeof rawData.amount !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid payment record; missing userId, passType, or amount.' },
        { status: 500 }
      );
    }
    const paymentData = {
      ...rawData,
      userId: rawData.userId as string,
      passType: rawData.passType as string,
      amount: rawData.amount as number,
      status: (rawData.status as string) ?? '',
      selectedEvents: Array.isArray(rawData.selectedEvents) ? (rawData.selectedEvents as string[]) : [],
      selectedDays: Array.isArray(rawData.selectedDays) ? (rawData.selectedDays as string[]) : [],
      teamId: typeof rawData.teamId === 'string' ? rawData.teamId : undefined,
      countryId: rawData.countryId,
      countryName: rawData.countryName,
    };

    // 2. If payment not yet success, confirm with Cashfree and update
    if (paymentData.status !== 'success') {
      const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID || process.env.CASHFREE_APP_ID;
      const secret = process.env.CASHFREE_SECRET_KEY;
      if (!appId || !secret) {
        return NextResponse.json(
          { success: false, error: 'Cashfree not configured' },
          { status: 500 }
        );
      }

      const cfRes = await fetch(`${CASHFREE_BASE}/orders/${orderId}`, {
        headers: {
          'x-client-id': appId,
          'x-client-secret': secret,
          'x-api-version': '2025-01-01',
        },
      });
      if (!cfRes.ok) {
        const text = await cfRes.text();
        return NextResponse.json(
          { success: false, error: `Cashfree API error: ${cfRes.status}`, details: text },
          { status: 500 }
        );
      }
      const order = await cfRes.json();
      if (order.order_status !== 'PAID') {
        return NextResponse.json(
          {
            success: false,
            error: `Payment not confirmed. Cashfree status: ${order.order_status}`,
            orderId,
          },
          { status: 400 }
        );
      }

      await paymentDoc.ref.update({ status: 'success', updatedAt: new Date() });
    }

    // 3. Event access
    const selectedEvents = paymentData.selectedEvents;
    let hasTechEvents = false;
    let hasNonTechEvents = false;
    try {
      const events = await getCachedEventsByIds(selectedEvents);
      hasTechEvents = events.some((e) => e?.category === 'technical');
      hasNonTechEvents = events.some((e) => e?.category === 'non_technical');
    } catch {
      // continue
    }

    // 4. Transaction: create pass if missing
    const result = await db.runTransaction(async (transaction) => {
      const existingPassQuery = db.collection('passes').where('paymentId', '==', orderId).limit(1);
      const existingSnap = await transaction.get(existingPassQuery);
      if (!existingSnap.empty) {
        const existing = existingSnap.docs[0];
        return { created: false, passId: existing.id, qrCode: existing.data().qrCode as string };
      }

      const passRef = db.collection('passes').doc();
      const userDocRef = db.collection('users').doc(paymentData.userId);
      const userDoc = await transaction.get(userDocRef);
      const userData = userDoc.exists ? userDoc.data() : null;

      const { encryptQRData } = await import('@/lib/crypto/qrEncryption');

      let qrData: Record<string, unknown>;
      if (paymentData.passType === 'group_events' && paymentData.teamId) {
        const teamId = paymentData.teamId;
        const teamDocRef = db.collection('teams').doc(teamId);
        const teamDoc = await transaction.get(teamDocRef);
        const teamData = teamDoc.exists ? teamDoc.data() : null;
        if (teamData) {
          qrData = {
            id: passRef.id,
            passType: paymentData.passType,
            teamName: teamData.teamName || '',
            members: (teamData.members || []).map((m: { name: string; isLeader?: boolean }) => ({
              name: m.name,
              isLeader: m.isLeader,
            })),
            events: selectedEvents,
            days: paymentData.selectedDays || [],
          };
        } else {
          qrData = {
            id: passRef.id,
            name: userData?.name || 'Unknown',
            passType: paymentData.passType,
            events: selectedEvents,
            days: paymentData.selectedDays || [],
          };
        }
      } else {
        qrData = {
          id: passRef.id,
          name: userData?.name || 'Unknown',
          passType: paymentData.passType,
          events: selectedEvents,
          days: paymentData.selectedDays || [],
        };
      }

      const encryptedData = encryptQRData(qrData);
      const qrCodeUrl: string = await QRCode.toDataURL(encryptedData, {
        errorCorrectionLevel: 'H',
        width: 400,
      });

      const passData: Record<string, unknown> = {
        userId: paymentData.userId,
        passType: paymentData.passType,
        amount: paymentData.amount,
        paymentId: orderId,
        status: 'paid',
        qrCode: qrCodeUrl,
        createdAt: new Date(),
        selectedEvents,
        selectedDays: paymentData.selectedDays,
        eventAccess: {
          tech: hasTechEvents,
          nonTech: hasNonTechEvents,
          proshowDays: paymentData.passType === 'proshow' ? ['2026-02-26', '2026-02-28'] : [],
          fullAccess: paymentData.passType === 'sana_concert',
        },
      };
      if (paymentData.countryId != null) {
        passData.countryId = paymentData.countryId;
        if (paymentData.countryName != null) passData.countryName = paymentData.countryName;
      }

      if (paymentData.passType === 'group_events' && paymentData.teamId) {
        const teamId = paymentData.teamId;
        try {
          const teamDocRef = db.collection('teams').doc(teamId);
          const teamDoc = await transaction.get(teamDocRef);
          if (teamDoc.exists) {
            const teamData = teamDoc.data();
            passData.teamId = teamId;
            passData.teamSnapshot = {
              teamName: teamData?.teamName || '',
              totalMembers: teamData?.members?.length || 0,
              members: (teamData?.members || []).map((member: { memberId: string; name: string; phone: string; isLeader?: boolean }) => ({
                memberId: member.memberId,
                name: member.name,
                phone: member.phone,
                isLeader: member.isLeader,
                checkedIn: false,
              })),
            };
            transaction.update(teamDocRef, {
              passId: passRef.id,
              paymentStatus: 'success',
              updatedAt: new Date(),
            });
          }
        } catch {
          // continue
        }
      }

      transaction.set(passRef, passData);
      return { created: true, passId: passRef.id, qrCode: qrCodeUrl };
    });

    // 5. Send email if pass was created
    if (result.created) {
      const userDoc = await db.collection('users').doc(paymentData.userId).get();
      const userData = userDoc.data();
      if (userData?.email) {
        const emailTemplate = emailTemplates.passConfirmation({
          name: userData.name ?? 'there',
          amount: paymentData.amount,
          passType: paymentData.passType,
          college: userData.college ?? '-',
          phone: userData.phone ?? '-',
          qrCodeUrl: result.qrCode ?? '',
        });
        try {
          const passDoc = await db.collection('passes').doc(result.passId).get();
          const finalPassData = passDoc.data();
          const pdfBuffer = await generatePassPDFBuffer({
            passType: paymentData.passType,
            amount: paymentData.amount,
            userName: userData.name ?? 'User',
            email: userData.email,
            phone: userData.phone ?? '-',
            college: userData.college ?? '-',
            qrCode: result.qrCode ?? '',
            teamName: finalPassData?.teamSnapshot?.teamName,
            members: finalPassData?.teamSnapshot?.members,
          });
          await sendEmail({
            to: userData.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            attachments: [
              { filename: `takshashila-pass-${paymentData.passType}.pdf`, content: pdfBuffer },
            ],
          });
        } catch {
          await sendEmail({
            to: userData.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });
        }
      }
    }

    const passDoc = await db.collection('passes').doc(result.passId).get();
    const passOut = passDoc.exists ? { id: passDoc.id, ...passDoc.data() } : null;

    return NextResponse.json({
      success: true,
      payment: { id: paymentDoc.id, ...paymentData, status: 'success' },
      pass: passOut,
      passCreated: result.created,
      message: result.created ? 'Pass created and email sent.' : 'Pass already existed.',
    });
  } catch (error) {
    console.error('[FixStuckPayment] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Server error',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
