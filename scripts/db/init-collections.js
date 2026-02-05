
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

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

async function forceCreateCollections() {
    const testData = {
        _dummy: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        note: 'Initial collection creation'
    };

    await db.collection('passes').doc('_init_').set(testData);
    await db.collection('teams').doc('_init_').set(testData);
    await db.collection('payments').doc('_init_').set(testData);
    await db.collection('registrations').doc('_init_').set(testData);

    console.log('Successfully initialized collections: passes, teams, payments, registrations');
}

forceCreateCollections().catch(console.error);
