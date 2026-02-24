/**
 * Insert a test pass directly into Firestore for debugging.
 * 
 * Usage:
 *   node scripts/testing/insert-test-pass.js
 * 
 * Requires .env.local (or .env) with Firebase Admin credentials.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load .env.local using dotenv-style parsing
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const name of envFiles) {
    const envPath = path.resolve(__dirname, '../../', name);
    if (fs.existsSync(envPath)) {
      console.log(`Loading env from: ${envPath}`);
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx < 1) continue;
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        // Remove surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        // Unescape literal \n
        val = val.replace(/\\n/g, '\n');
        process.env[key] = val;
      }
      return;
    }
  }
  console.error('No .env.local or .env found!');
  process.exit(1);
}

loadEnv();

// Debug: check what got loaded
console.log('ENV check:');
console.log('  FIREBASE_PROJECT_ID:', !!process.env.FIREBASE_PROJECT_ID, process.env.FIREBASE_PROJECT_ID ? '(set)' : '(empty)');
console.log('  NEXT_PUBLIC_FIREBASE_PROJECT_ID:', !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '(set)' : '(empty)');
console.log('  FIREBASE_ADMIN_CLIENT_EMAIL:', !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL, process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? '(set)' : '(empty)');
console.log('  FIREBASE_ADMIN_PRIVATE_KEY:', (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').length > 0 ? `(${(process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').length} chars)` : '(empty)');

// Initialize Admin
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (serviceAccountKey) {
  try {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountKey)) });
  } catch (e) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e.message);
    process.exit(1);
  }
} else {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase Admin credentials. Need FIREBASE_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY');
    process.exit(1);
  }
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    })
  });
}

const db = admin.firestore();

async function insertTestPass() {
  const TARGET_USER_ID = 'rVVrTLog4VaW17MJcG5t55vAsSq2';

  // Exactly matches the auto-created pass format from payment/verify
  const passData = {
    userId: TARGET_USER_ID,
    passType: 'day_pass',
    amount: 500,
    paymentId: `test_debug_${Date.now()}`,
    status: 'paid',
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // tiny 1x1 placeholder
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    selectedEvents: ['photography-workshop'],
    selectedDays: ['2026-02-28'],
    eventAccess: {
      tech: false,
      nonTech: true,
      proshowDays: [],
      fullAccess: false,
    },
  };

  console.log('\n--- Inserting test pass ---');
  console.log('User ID:', TARGET_USER_ID);
  console.log('Pass data:', JSON.stringify(passData, null, 2));

  const passRef = db.collection('passes').doc();
  await passRef.set(passData);

  console.log(`\n✅ Pass created with ID: ${passRef.id}`);
  console.log('Now refresh the Profile page to check if it appears.\n');

  // Also list all passes for this user to verify
  console.log('--- All passes for this user ---');
  const snapshot = await db.collection('passes').where('userId', '==', TARGET_USER_ID).get();
  if (snapshot.empty) {
    console.log('(none found — something is wrong with Firestore)');
  } else {
    snapshot.forEach(doc => {
      const d = doc.data();
      console.log(`  ${doc.id} => status=${d.status}, passType=${d.passType}, amount=${d.amount}`);
    });
  }

  process.exit(0);
}

insertTestPass().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
