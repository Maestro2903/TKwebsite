
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
                let val = match[2].trim();
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                process.env[match[1]] = val;
            }
        });
    }
}

loadEnv();

const QR_SECRET = process.env.QR_SECRET_KEY || 'default-secret-change-in-production';

// Signing logic replicated from backend/lib/qr-signing.ts
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
    return JSON.stringify({
        passId,
        userId,
        passType,
        token: signedToken,
    });
}

// Initialize Firebase Admin
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (serviceAccountKey) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountKey)) });
} else if (clientEmail && privateKey) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        })
    });
}

const db = admin.firestore();

async function generateRealTestPass() {
    // 1. Find user (Tejesh)
    const userId = 's1WEgkKpkXhqhKNi3DslgLxcf4H2';
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
        console.log('Target user not found.');
        return;
    }

    // 2. Setup Data
    const passId = `functional_test_${Date.now()}`;
    const passType = 'sana_concert'; // Example real pass type
    const amount = 1500;

    // 3. Generate REAL Signed QR
    const qrData = createQRPayload(passId, userId, passType);
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    // 4. Create Pass Document
    const passRef = db.collection('passes').doc(passId);
    const passData = {
        userId,
        passType,
        amount,
        paymentId: `test_pay_${Date.now()}`,
        status: 'paid',
        qrCode: qrCodeUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isProductionTest: true
    };

    await passRef.set(passData);
    console.log(`Successfully generated functional pass: ${passId}`);
    console.log(`QR Payload: ${qrData.substring(0, 50)}...`);
}

generateRealTestPass().catch(console.error);
