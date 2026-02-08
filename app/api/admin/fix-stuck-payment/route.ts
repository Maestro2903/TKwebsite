import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getAdminFirestore } from '@/lib/firebase/adminApp';
import { createQRPayload } from '@/features/passes/qrService';
import { sendEmail, emailTemplates } from '@/features/email/emailService';
import { generatePassPDFBuffer } from '@/features/passes/pdfGenerator.server';

const CASHFREE_BASE =
    process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';

/**
 * Admin endpoint to manually fix stuck payments
 * Usage: POST /api/admin/fix-stuck-payment with { orderId: "order_xxxx" }
 * 
 * This endpoint:
 * 1. Checks payment status in Cashfree
 * 2. Updates payment record in Firestore
 * 3. Creates pass if payment is PAID
 * 4. Sends confirmation email
 */
export async function POST(req: NextRequest) {
    try {
        const { orderId } = await req.json();
        console.log(`[FixPayment] ========== Manual fix requested for: ${orderId} ==========`);

        if (!orderId || typeof orderId !== 'string') {
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }

        const db = getAdminFirestore();
        const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID || process.env.CASHFREE_APP_ID;
        const secret = process.env.CASHFREE_SECRET_KEY;

        if (!appId || !secret) {
            console.error('[FixPayment] Missing Cashfree credentials');
            return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
        }

        // Step 1: Check Cashfree
        console.log('[FixPayment] Step 1: Checking Cashfree order status...');
        const response = await fetch(`${CASHFREE_BASE}/orders/${orderId}`, {
            headers: {
                'x-client-id': appId,
                'x-client-secret': secret,
                'x-api-version': '2025-01-01',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[FixPayment] Cashfree API error: ${response.status}`, errorText);
            return NextResponse.json(
                { error: `Cashfree API error: ${response.status}`, details: errorText },
                { status: 500 }
            );
        }

        const order = await response.json();
        console.log(`[FixPayment] Cashfree order status: ${order.order_status}`);

        if (order.order_status !== 'PAID') {
            return NextResponse.json(
                {
                    success: false,
                    error: `Cannot fix: Payment status is ${order.order_status} (not PAID)`,
                    cashfreeStatus: order.order_status,
                },
                { status: 400 }
            );
        }

        console.log('[FixPayment] ✅ Order is PAID in Cashfree');

        // Step 2: Find payment record
        console.log('[FixPayment] Step 2: Looking up payment record...');
        const paymentsSnapshot = await db
            .collection('payments')
            .where('cashfreeOrderId', '==', orderId)
            .limit(1)
            .get();

        if (paymentsSnapshot.empty) {
            console.error('[FixPayment] Payment record not found in Firestore');
            return NextResponse.json(
                { error: 'Payment record not found in database', orderId },
                { status: 404 }
            );
        }

        const paymentDoc = paymentsSnapshot.docs[0];
        const paymentData = paymentDoc.data();
        console.log(`[FixPayment] Found payment for user: ${paymentData.userId}, current status: ${paymentData.status}`);

        // Step 3: Update payment status
        if (paymentData.status !== 'success') {
            console.log('[FixPayment] Step 3: Updating payment status to success...');
            await paymentDoc.ref.update({
                status: 'success',
                updatedAt: new Date(),
                fixedManually: true, // Flag to track manual interventions
            });
            console.log('[FixPayment] ✅ Payment status updated');
        } else {
            console.log('[FixPayment] Payment status already "success"');
        }

        // Step 4: Check if pass exists
        console.log('[FixPayment] Step 4: Checking for existing pass...');
        const existingPassSnapshot = await db
            .collection('passes')
            .where('paymentId', '==', orderId)
            .limit(1)
            .get();

        if (!existingPassSnapshot.empty) {
            const existingPass = existingPassSnapshot.docs[0];
            console.log(`[FixPayment] Pass already exists: ${existingPass.id}`);
            return NextResponse.json({
                success: true,
                message: 'Payment already processed (pass exists)',
                passId: existingPass.id,
                qrCode: existingPass.data().qrCode,
            });
        }

        // Step 5: Create pass
        console.log('[FixPayment] Step 5: Creating pass...');
        const passRef = db.collection('passes').doc();
        const qrData = createQRPayload(passRef.id, paymentData.userId, paymentData.passType);
        const qrCodeUrl = await QRCode.toDataURL(qrData);

        const passData: any = {
            userId: paymentData.userId,
            passType: paymentData.passType,
            amount: paymentData.amount,
            paymentId: orderId,
            status: 'paid',
            qrCode: qrCodeUrl,
            createdAt: new Date(),
            createdManually: true, // Flag for manual creation
        };

        // Handle group events
        if (paymentData.passType === 'group_events' && paymentData.teamId) {
            console.log('[FixPayment] Processing group event team data...');
            try {
                const teamDoc = await db.collection('teams').doc(paymentData.teamId).get();
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

                    await db.collection('teams').doc(paymentData.teamId).update({
                        passId: passRef.id,
                        paymentStatus: 'success',
                        updatedAt: new Date(),
                    });
                    console.log('[FixPayment] Team status updated');
                }
            } catch (teamError) {
                console.error('[FixPayment] Error fetching team:', teamError);
            }
        }

        await passRef.set(passData);
        console.log(`[FixPayment] ✅ Pass created: ${passRef.id}`);

        // Step 6: Send email
        console.log('[FixPayment] Step 6: Sending confirmation email...');
        const userDoc = await db.collection('users').doc(paymentData.userId as string).get();
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
                console.log('[FixPayment] ✅ Email sent successfully');
            } catch (emailError) {
                console.error('[FixPayment] Email error:', emailError);
                // Continue even if email fails
            }
        }

        console.log('[FixPayment] ========== Manual fix completed successfully ==========');

        return NextResponse.json({
            success: true,
            message: 'Payment fixed successfully',
            passId: passRef.id,
            qrCode: qrCodeUrl,
            details: {
                orderId,
                userId: paymentData.userId,
                passType: paymentData.passType,
                amount: paymentData.amount,
            },
        });
    } catch (error: unknown) {
        console.error('[FixPayment] ========== ERROR ==========');
        console.error('[FixPayment] Error details:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Server error',
                details: error instanceof Error ? error.stack : String(error),
            },
            { status: 500 }
        );
    }
}
