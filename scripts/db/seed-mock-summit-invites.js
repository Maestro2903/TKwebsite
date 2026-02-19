/**
 * Seed Mock Global Summit access codes in mockSummitAccessCodes collection.
 *
 * Schema: { code, maxUsage, usedCount, expiresAt, active, createdBy, createdAt }
 *
 * Run with: node scripts/db/seed-mock-summit-invites.js
 *
 * Optional env: MOCK_SUMMIT_CREATED_BY (default: 'seed-script')
 */

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
  try {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountKey)) });
  } catch (e) {
    console.error('Failed to init Firebase:', e.message);
    process.exit(1);
  }
} else {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase env vars. Use FIREBASE_SERVICE_ACCOUNT_KEY or individual credentials.');
    process.exit(1);
  }
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (e) {
    console.error('Failed to init Firebase:', e.message);
    process.exit(1);
  }
}

const db = admin.firestore();

const createdBy = process.env.MOCK_SUMMIT_CREATED_BY || 'seed-script';

// Example codes – edit as needed
const CODES = [
  { code: 'MOCKSUMMIT2026', maxUsage: 50 },
  { code: 'SUMMIT-VIP-01', maxUsage: 10 },
];

async function main() {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

  for (const { code, maxUsage } of CODES) {
    const doc = {
      code,
      maxUsage,
      usedCount: 0,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      active: true,
      createdBy,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('mockSummitAccessCodes').doc(code).set(doc);
    console.log(`  ✓ ${code} (max ${maxUsage} uses, expires ${expiresAt.toISOString().slice(0, 10)})`);
  }

  console.log(`\nDone. Created ${CODES.length} access code(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
