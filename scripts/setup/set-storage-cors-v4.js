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
        const bucketName = 'cit-takshashila-2026-3fd85.firebasestorage.app';
        console.log(`Setting CORS for bucket: ${bucketName}`);

        // Some versions of the library prefer the bucket name without prefixes, 
        // but we'll try to get the bucket object directly.
        const bucket = storage.bucket(bucketName);

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
        if (err.message.includes('bucket does not exist')) {
            console.log('Trying with .appspot.com suffix...');
            try {
                const altBucketName = 'cit-takshashila-2026-3fd85.appspot.com';
                await storage.bucket(altBucketName).setCorsConfiguration([
                    {
                        origin: ['https://takshashila26.vercel.app', 'http://localhost:3000'],
                        method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                        responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
                        maxAgeSeconds: 3600
                    }
                ]);
                console.log(`✓ CORS configuration updated successfully for ${altBucketName}`);
                process.exit(0);
            } catch (err2) {
                console.error('Error with alt bucket:', err2.message);
            }
        }
        process.exit(1);
    }
}

run().then(() => process.exit(0));
