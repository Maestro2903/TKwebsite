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
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
} else {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        }),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
}

const storage = admin.storage();

async function run() {
    try {
        console.log('Listing buckets...');
        // Access the underlying @google-cloud/storage instance
        // Note: in firebase-admin 10+, admin.storage() returns a Storage object containing the bucket() method
        // To get the Cloud Storage client instance:
        const gcs = storage.bucket().storage;
        const [buckets] = await gcs.getBuckets();

        if (buckets.length === 0) {
            console.log('No buckets found in this project.');
            return;
        }

        console.log(`Found ${buckets.length} buckets:`);
        for (const b of buckets) {
            console.log(`- ${b.name}`);

            console.log(`Setting CORS for ${b.name}...`);
            const corsConfiguration = [
                {
                    origin: ['https://takshashila26.vercel.app', 'http://localhost:3000'],
                    method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                    responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
                    maxAgeSeconds: 3600
                }
            ];

            await b.setCorsConfiguration(corsConfiguration);
            console.log(`✓ CORS updated for ${b.name}`);
        }
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run().then(() => process.exit(0));
