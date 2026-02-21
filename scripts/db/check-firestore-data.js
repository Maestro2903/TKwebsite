const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envFiles = [
        path.resolve(__dirname, '../../.env'),
        path.resolve(__dirname, '../../.env.local'),
    ];
    for (const envPath of envFiles) {
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split('\n').forEach((line) => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    let key = match[1].trim();
                    let val = match[2].trim();
                    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                    process.env[key] = val.replace(/\\n/g, '\n');
                }
            });
            return;
        }
    }
}

loadEnv();

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (serviceAccountKey) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountKey)) });
} else {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

async function checkData() {
    console.log('--- MOCK SUMMIT ACCESS CODES ---');
    const codes = await db.collection('mockSummitAccessCodes').get();
    codes.forEach(doc => {
        console.log(`Document ID: ${doc.id}`);
        console.log(JSON.stringify(doc.data(), null, 2));
    });

    console.log('\n--- GROUP EVENTS ---');
    const events = await db.collection('events').where('type', '==', 'group').get();
    events.forEach(doc => {
        const data = doc.data();
        console.log(`Event: ${data.name} (${doc.id})`);
        console.log(`Allowed Pass Types: ${JSON.stringify(data.allowedPassTypes)}`);
    });
}

checkData().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
});
