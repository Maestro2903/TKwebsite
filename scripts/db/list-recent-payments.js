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

async function listPayments() {
    console.log('Fetching last 5 payments...');
    const snapshot = await db.collection('payments').orderBy('createdAt', 'desc').limit(5).get();

    if (snapshot.empty) {
        console.log('No payments found.');
        return;
    }

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`Order ID: ${doc.id}`);
        console.log(` - Status: ${data.status}`);
        console.log(` - Amount: ${data.amount}`);
        console.log(` - User ID: ${data.userId}`);
        console.log(` - Created At: ${data.createdAt?.toDate?.() || data.createdAt}`);
        console.log('-------------------');
    });
}

listPayments().catch(console.error);
