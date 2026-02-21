const { Storage } = require('@google-cloud/storage');
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

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : {
        project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        private_key: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };

const storage = new Storage({
    projectId: serviceAccountJson.project_id,
    credentials: {
        client_email: serviceAccountJson.client_email,
        private_key: serviceAccountJson.private_key,
    }
});

async function run() {
    try {
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
