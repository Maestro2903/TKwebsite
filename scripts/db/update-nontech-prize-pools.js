#!/usr/bin/env node

/**
 * Update non-tech event prize pools in Firestore
 * Battle of Bands: 20000 | RAP-A-THON: 6000
 *
 * Run with: node scripts/db/update-nontech-prize-pools.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

function loadEnv() {
  const envFiles = [
    path.resolve(__dirname, '../../.env.local'),
    path.resolve(__dirname, '../../.env'),
  ];
  for (const envPath of envFiles) {
    if (fs.existsSync(envPath)) {
      console.log(`📄 Loading environment from: ${path.basename(envPath)}`);
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let val = match[2].trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
          process.env[key] = val.replace(/\\n/g, '\n');
        }
      });
      return;
    }
  }
  console.warn('⚠️  No .env or .env.local file found');
}

loadEnv();

if (!admin.apps.length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountKey)) });
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

const prizePoolUpdates = {
  'battle-of-bands': 20000,
  'rap-a-thon': 6000,
};

async function main() {
  const batch = db.batch();
  for (const [eventId, prizePool] of Object.entries(prizePoolUpdates)) {
    const ref = db.collection('events').doc(eventId);
    batch.update(ref, { prizePool, updatedAt: new Date() });
  }
  await batch.commit();
  console.log('✅ Updated prize pools in Firestore:');
  console.log('   battle-of-bands: ₹20,000');
  console.log('   rap-a-thon: ₹6,000');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
