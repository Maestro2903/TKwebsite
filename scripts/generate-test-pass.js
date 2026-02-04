
const admin = require('firebase-admin');
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
                // Remove quotes if present
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                process.env[match[1]] = val;
            }
        });
    }
}

loadEnv();

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (serviceAccountKey) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountKey))
    });
} else if (clientEmail && privateKey) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        })
    });
} else {
    console.error("No Firebase credentials found in environment.");
    process.exit(1);
}

const db = admin.firestore();

async function generateTestPass() {
    // 1. Find the most recent user
    const userSnapshot = await db.collection('users').orderBy('createdAt', 'desc').limit(1).get();

    if (userSnapshot.empty) {
        console.log('No users found in database to assign a pass to.');
        return;
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    console.log(`Found user: ${userData.name} (${userId})`);

    // 2. Create a test pass
    const passId = `test_pass_${Date.now()}`;
    const passRef = db.collection('passes').doc(passId);

    const passData = {
        userId,
        passType: 'pro_show', // Example pass type
        amount: 999,
        paymentId: `test_pay_${Date.now()}`,
        status: 'success',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', // Tiny 1x1 base64 pixel
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        testPass: true
    };

    await passRef.set(passData);
    console.log(`Successfully generated pass ${passId} for user ${userId}`);
}

generateTestPass().catch(console.error);
