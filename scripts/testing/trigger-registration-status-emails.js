/**
 * Trigger all three registration status emails for a test address.
 *
 * Usage:
 *   node scripts/testing/trigger-registration-status-emails.js
 *
 * Requires your usual FIREBASE_ADMIN_* env vars or FIREBASE_SERVICE_ACCOUNT_KEY.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  // Try project root .env.local or .env
  const candidates = ['.env.local', '.env'];
  for (const filename of candidates) {
    const envPath = path.resolve(process.cwd(), filename);
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
      break;
    }
  }
}

loadEnv();

if (!admin.apps.length) {
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
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      }),
    });
  }
}

const db = admin.firestore();

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const email =
    process.argv[2] ||
    process.env.TEST_EMAIL_TO ||
    'takshashila@citchennai.net';
  const name = process.env.TEST_NAME || 'Takshashila';
  const userId = 'test-status-email-user';

  console.log('🔥 Creating test registration for:', email);

  const registrationId = `test-status-email-${Date.now()}`;
  const ref = db.collection('registrations').doc(registrationId);

  await ref.set({
    userId,
    name,
    email,
    status: 'draft',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log('✅ Created registration:', registrationId);

  const statuses = ['pending', 'converted', 'cancelled'];

  for (const status of statuses) {
    console.log(`\n➡️  Updating status to: ${status}`);
    await ref.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('   Update written. Waiting a few seconds for Cloud Function...');
    await sleep(7000);
  }

  console.log('\n🎉 Done. Check inbox and Firestore emailLogs for:');
  console.log(`   - ${registrationId}_pending`);
  console.log(`   - ${registrationId}_converted`);
  console.log(`   - ${registrationId}_cancelled`);
}

main().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});

