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
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebasestorage.app`;

if (serviceAccountKey) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
        storageBucket
    });
} else {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        }),
        storageBucket
    });
}

const POTENTIAL_BUCKETS = [
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebasestorage.app`,
    `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`
].filter(Boolean);

async function setCors() {
    const errors = [];
    for (const bucketName of [...new Set(POTENTIAL_BUCKETS)]) {
        try {
            console.log(`Attempting to set CORS for bucket: ${bucketName}`);
            const bucket = admin.storage().bucket(bucketName);

            const corsConfiguration = [
                {
                    origin: [
                        'https://takshashila26.vercel.app',
                        'http://localhost:3000'
                    ],
                    method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                    responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
                    maxAgeSeconds: 3600
                }
            ];

            await bucket.setCorsConfiguration(corsConfiguration);
            console.log(`✓ CORS configuration updated successfully for ${bucketName}`);
            return; // Success!
        } catch (e) {
            console.warn(`  × Failed for ${bucketName}: ${e.message}`);
            errors.push({ bucket: bucketName, error: e.message });
        }
    }

    console.error('\n❌ All bucket attempts failed:');
    console.error(JSON.stringify(errors, null, 2));
    process.exit(1);
}

setCors().then(() => process.exit(0)).catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
