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
        console.log(`Using Project ID: ${serviceAccount.project_id}`);
        console.log('Listing buckets...');
        const [buckets] = await storage.getBuckets();

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
