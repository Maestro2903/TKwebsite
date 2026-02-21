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
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
    });
} else {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        }),
    });
}

async function listBuckets() {
    const [buckets] = await admin.storage().storage.getBuckets();
    console.log('Available buckets:');
    buckets.forEach(bucket => {
        console.log(`- ${bucket.name}`);
    });
}

listBuckets().then(() => process.exit(0)).catch(e => {
    console.error('❌ Failed to list buckets:', e);
    process.exit(1);
});
