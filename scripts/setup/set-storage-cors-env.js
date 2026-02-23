require('dotenv').config({ path: '.env' });
const { Storage } = require('@google-cloud/storage');

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

const storage = new Storage({
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  credentials: {
    client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    private_key: privateKey
  }
});

async function run() {
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    console.error('Bucket name missing in .env');
    return process.exit(1);
  }

  try {
    console.log(`Setting CORS for bucket: ${bucketName}`);
    const bucket = storage.bucket(bucketName);
    
    // Check if bucket exists
    const [exists] = await bucket.exists();
    if (!exists) {
        console.error(`Bucket ${bucketName} does not exist according to API.`);
        return process.exit(1);
    }

    const corsConfiguration = [
      {
        origin: ['*'], // Allowing all for testing, can restrict to takshashila26.vercel.app later
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
