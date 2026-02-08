const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                let key = match[1].trim();
                let val = match[2].trim();
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                process.env[key] = val.replace(/\\n/g, '\n');
            }
        });
    }
}

loadEnv();

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY
    })
});

const db = admin.firestore();

const CASHFREE_BASE =
    process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';

async function manuallyVerifyPayment(orderId) {
    console.log(`\n=== Manual Payment Verification for ${orderId} ===\n`);

    // Step 1: Check Cashfree
    const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID || process.env.CASHFREE_APP_ID;
    const secret = process.env.CASHFREE_SECRET_KEY;

    if (!appId || !secret) {
        console.error('❌ Missing Cashfree credentials');
        return;
    }

    console.log('1. Checking Cashfree order status...');
    const response = await fetch(`${CASHFREE_BASE}/orders/${orderId}`, {
        headers: {
            'x-client-id': appId,
            'x-client-secret': secret,
            'x-api-version': '2025-01-01',
        },
    });

    if (!response.ok) {
        console.error(`❌ Cashfree API error: ${response.status}`);
        return;
    }

    const order = await response.json();
    console.log(`   Status: ${order.order_status}`);

    if (order.order_status !== 'PAID') {
        console.log(`❌ Order not paid. Current status: ${order.order_status}`);
        return;
    }

    console.log('✅ Order is PAID in Cashfree\n');

    // Step 2: Check Firestore payment record
    console.log('2. Checking Firestore payment record...');
    const paymentsSnapshot = await db
        .collection('payments')
        .where('cashfreeOrderId', '==', orderId)
        .limit(1)
        .get();

    if (paymentsSnapshot.empty) {
        console.error('❌ Payment record not found in Firestore');
        return;
    }

    const paymentDoc = paymentsSnapshot.docs[0];
    const paymentData = paymentDoc.data();
    console.log(`   Current status in DB: ${paymentData.status}`);
    console.log(`   User ID: ${paymentData.userId}`);
    console.log(`   Amount: ${paymentData.amount}`);
    console.log(`   Pass Type: ${paymentData.passType}\n`);

    // Step 3: Update payment status if needed
    if (paymentData.status === 'pending') {
        console.log('3. Updating payment status to success...');
        await paymentDoc.ref.update({
            status: 'success',
            updatedAt: new Date()
        });
        console.log('✅ Payment status updated\n');
    } else {
        console.log('✅ Payment status already updated\n');
    }

    // Step 4: Check if pass exists
    console.log('4. Checking if pass exists...');
    const existingPassSnapshot = await db
        .collection('passes')
        .where('paymentId', '==', orderId)
        .limit(1)
        .get();

    if (!existingPassSnapshot.empty) {
        const existingPass = existingPassSnapshot.docs[0];
        console.log(`✅ Pass already exists: ${existingPass.id}\n`);
        return;
    }

    console.log('   Pass does not exist. Creating new pass...\n');

    // Step 5: Create pass
    const QRCode = require('qrcode');
    const { createQRPayload } = require('../../src/features/passes/qrService');

    const passRef = db.collection('passes').doc();
    const qrData = createQRPayload(
        passRef.id,
        paymentData.userId,
        paymentData.passType
    );
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    const passData = {
        userId: paymentData.userId,
        passType: paymentData.passType,
        amount: paymentData.amount,
        paymentId: orderId,
        status: 'paid',
        qrCode: qrCodeUrl,
        createdAt: new Date(),
    };

    // Handle group events
    if (paymentData.passType === 'group_events' && paymentData.teamId) {
        console.log('5. Processing group event team data...');
        try {
            const teamDoc = await db.collection('teams').doc(paymentData.teamId).get();
            if (teamDoc.exists) {
                const teamData = teamDoc.data();
                passData.teamId = paymentData.teamId;
                passData.teamSnapshot = {
                    teamName: teamData?.teamName || '',
                    totalMembers: teamData?.members?.length || 0,
                    members: (teamData?.members || []).map((member) => ({
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
                console.log('✅ Team status updated\n');
            }
        } catch (teamError) {
            console.error('⚠️ Error fetching team data:', teamError);
        }
    }

    await passRef.set(passData);
    console.log(`✅ Pass created successfully: ${passRef.id}\n`);
    console.log('=== Verification Complete ===');
}

// Get order ID from command line argument
const orderId = process.argv[2];
if (!orderId) {
    console.error('Usage: node manual-verify-payment.js <order_id>');
    process.exit(1);
}

manuallyVerifyPayment(orderId)
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
