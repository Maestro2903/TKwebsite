const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.resolve(__dirname, '../../cit-takshashila-2026-3fd85-firebase-adminsdk-fbsvc-d557fcbaec.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const storage = new Storage({
    projectId: serviceAccount.project_id,
    keyFilename: serviceAccountPath
});

const BUCKETS_TO_TRY = [
    'cit-takshashila-2026-3fd85.firebasestorage.app',
    'cit-takshashila-2026-3fd85.appspot.com',
    'cit-takshashila-2026-3fd85',
    'cit-takshashila-2026.appspot.com',
    'cit-takshashila-2026'
];

async function run() {
    for (const name of BUCKETS_TO_TRY) {
        try {
            console.log(`Checking bucket: ${name}`);
            const bucket = storage.bucket(name);
            const [exists] = await bucket.exists();

            if (exists) {
                console.log(`✓ Bucket ${name} exists. Setting CORS...`);
                const corsConfiguration = [
                    {
                        origin: ['https://takshashila26.vercel.app', 'http://localhost:3000'],
                        method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                        responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
                        maxAgeSeconds: 3600
                    }
                ];
                await bucket.setCorsConfiguration(corsConfiguration);
                console.log(`✓ CORS configuration updated successfully for ${name}`);
                process.exit(0);
            } else {
                console.log(`  × Bucket ${name} does not exist according to API.`);
            }
        } catch (err) {
            console.warn(`  ! Error checking ${name}: ${err.message}`);
        }
    }

    console.error('\n❌ Could not find or access any expected buckets.');
    process.exit(1);
}

run().then(() => process.exit(0));
