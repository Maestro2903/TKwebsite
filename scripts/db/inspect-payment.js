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
const orderId = process.argv[2] || 'order_1770562627490_L2bOQk0r';

async function inspectPayment() {
    console.log(`Inspecting Payment Document: ${orderId}`);
    const doc = await db.collection('payments').doc(orderId).get();

    if (!doc.exists) {
        console.log('Document DOES NOT EXIST by ID.');
        // Try searching by cashfreeOrderId
        const snap = await db.collection('payments').where('cashfreeOrderId', '==', orderId).get();
        if (snap.empty) {
            console.log('Document ALSO NOT FOUND by cashfreeOrderId.');
            return;
        }
        console.log('Document FOUND by searching cashfreeOrderId field.');
        console.log('Data:', JSON.stringify(snap.docs[0].data(), null, 2));
    } else {
        console.log('Document FOUND by ID.');
        console.log('Data:', JSON.stringify(doc.data(), null, 2));
    }
}

inspectPayment().catch(console.error);
