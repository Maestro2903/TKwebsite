
const admin = require('firebase-admin');
const crypto = require('crypto');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

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
const resend = new Resend(process.env.RESEND_API_KEY);

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

async function run() {
    const userId = 's1WEgkKpkXhqhKNi3DslgLxcf4H2'; // UID for Tejesh
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) throw new Error('User not found');
    const userData = userDoc.data();

    const testEmail = 'mtejeshx37@gmail.com';
    const passId = `final_paid_test_${Date.now()}`;
    const passType = 'premium_events';
    const amount = 3000;

    console.log(`Generating pass for ${userData.name} (Sending to: ${testEmail})...`);

    // QR Generation
    const qrData = createQRPayload(passId, userId, passType);
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    // Firestore Creation
    const passRef = db.collection('passes').doc(passId);
    await passRef.set({
        userId,
        passType,
        amount,
        paymentId: `test_pay_${Date.now()}`,
        status: 'paid',
        qrCode: qrCodeUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isSimulation: true
    });

    console.log('Pass document successfully created in Firestore.');

    // Email Confirmation
    console.log(`Sending confirmation email to ${testEmail}...`);
    // NOTE: Using onboarding@resend.dev because takshashila26.in domain is not verified yet
    const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: testEmail,
        subject: '🎟️ Registration Confirmed - CIT Takshashila 2026',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;">
        <h1 style="color: #7c3aed; text-align: center;">Registration Confirmed!</h1>
        <p>Hi <strong>${userData.name}</strong>, your pass is ready.</p>
        <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin: 24px 0;">
          <p><strong>Pass Type:</strong> ${passType}</p>
          <p><strong>Amount:</strong> ₹${amount}</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <p style="font-weight: bold;">Your Entry QR Code:</p>
          <img src="${qrCodeUrl}" alt="QR Code" style="width: 250px; border: 4px solid #7c3aed; border-radius: 12px;" />
        </div>
        <p style="text-align: center; color: #64748b;">See you at CIT Takshashila 2026!</p>
      </div>
    `,
    });

    if (error) {
        console.error('❌ Email failed:', error);
    } else {
        console.log('✅ Success! Email sent with ID:', data.id);
    }
}

run().catch(console.error);
