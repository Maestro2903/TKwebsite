const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.resolve(__dirname, '../../cit-takshashila-2026-3fd85-firebase-adminsdk-fbsvc-d557fcbaec.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const storage = new Storage({
    projectId: serviceAccount.project_id,
    keyFilename: serviceAccountPath
});

async function run() {
    try {
        const bucketName = 'cit-takshashila-2026';
        console.log(`Setting CORS for confirmed bucket: ${bucketName}`);

        const bucket = storage.bucket(bucketName);
        const [exists] = await bucket.exists();
        if (!exists) {
            console.error(`ERROR: Bucket ${bucketName} still not found via API.`);
            process.exit(1);
        }

        const corsConfiguration = [
            {
                origin: ['https://takshashila26.vercel.app', 'http://localhost:3000'],
                method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
                maxAgeSeconds: 3600
            }
        ];

        await bucket.setCorsConfiguration(corsConfiguration);
        console.log(`✓ CORS configuration updated successfully for ${bucketName}`);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

run().then(() => process.exit(0));
