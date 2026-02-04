
const admin = require('firebase-admin');
const crypto = require('crypto');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Basic .env parser
function loadEnv() {
    const envPath = path.resolve(__dirname, '../.env');
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

const QR_SECRET = process.env.QR_SECRET_KEY || 'default-secret-change-in-production';

// Replicating @/backend/lib/qr-signing.ts
function createSignedQR(passId, expiryDays = 30) {
    const expiry = Date.now() + expiryDays * 24 * 60 * 60 * 1000;
    const payload = `${passId}:${expiry}`;
    const signature = crypto
        .createHmac('sha256', QR_SECRET)
        .update(payload)
        .digest('hex')
        .substring(0, 16);
    return `${payload}.${signature}`;
}

function createQRPayload(passId, userId, passType) {
    const signedToken = createSignedQR(passId);
    return JSON.stringify({ passId, userId, passType, token: signedToken });
}

// Initialize Admin
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (serviceAccountKey) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountKey)) });
} else {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY
        })
    });
}

const db = admin.firestore();

async function approvePayment(orderId) {
    console.log(`Approving payment for Order: ${orderId}...`);

    const paymentDoc = await db.collection('payments').doc(orderId).get();
    if (!paymentDoc.exists) {
        throw new Error('Payment document not found');
    }

    const paymentData = paymentDoc.data();
    const userId = paymentData.userId;

    // 1. Update Payment Status
    await paymentDoc.ref.update({ status: 'success', approvedManually: true });
    console.log('Payment status updated to success.');

    // 2. Prepare Pass
    const passRef = db.collection('passes').doc(); // Generate new ID
    const passId = passRef.id;

    console.log(`Generating functional pass: ${passId} for user ${userId}...`);

    const qrData = createQRPayload(passId, userId, paymentData.passType);
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    const passData = {
        userId,
        passType: paymentData.passType,
        amount: paymentData.amount,
        paymentId: orderId,
        status: 'paid',
        qrCode: qrCodeUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await passRef.set(passData);
    console.log('Pass document created successfully.');
    console.log(`QR Payload: ${qrData.substring(0, 50)}...`);
}

// Order ID from Varun's screenshot
const VARUN_ORDER_ID = 'order_1770214878269_23D9WMHm';
approvePayment(VARUN_ORDER_ID).catch(console.error);
