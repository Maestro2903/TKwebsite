/**
 * Cleanup script to remove duplicate/legacy events from Firestore.
 *
 * Strategy:
 * - Keep events whose IDs are defined in scripts/db/seed-events.js
 * - From the list provided, delete any event IDs that are NOT in that set.
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
      console.log(`📄 Loading environment from: ${path.basename(envPath)}`);
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

  console.warn('⚠️  No .env or .env.local file found');
}

loadEnv();

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (serviceAccountKey) {
  console.log('🔐 Using FIREBASE_SERVICE_ACCOUNT_KEY from environment...\n');
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountKey)) });
} else {
  console.log('🔐 Using individual Firebase credentials from environment...\n');

  const requiredVars = {
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    }),
  });
}

const db = admin.firestore();

// Canonical event IDs taken from scripts/db/seed-events.js
const allowedIds = new Set([
  'choreo-showcase',
  'rap-a-thon',
  'treasure-hunt',
  'case-files',
  'frame-spot',
  'gaming-event',
  'filmfinatics',
  'entrepreneurship-talks',
  'finance-trading',
  'modelling',
  'cypher',
  'battle-of-bands',
  'solo-singing',
  'load-the-lyrics',
  'film-making',
  'vision-board-workshop',
  'duo-dance',
  'canvas-painting',
  'channel-surfing',
  'designers-onboard',
  'make-up-workshop',
  'photography-workshop',
  'branding',
  'upside-down-ctf',
  'deadlock',
  'borderland-protocol',
  'exchange-effect',
  'commit-kaaviyam',
  'big-data-cse',
  'astrotrack',
  'mlops-workshop',
  'pcb-workshop',
  'prompt-pixel',
  'mock-global-summit',
  'digital-detective',
  'click2cash',
  'industrial-automation',
  'aero-modelling',
  'electrodes-to-signals',
  'crack-the-code',
  'speedathon',
  'chain-of-lies',
  'building-games-web3',
  'escape-room',
  'soc-investigation',
  'the-90-minute-ceo',
]);

// IDs currently present in the events collection (from your list)
const candidateIds = [
  'aero-modelling',
  'astrotrack',
  'battle-of-bands',
  'big-data-cse',
  'big-data-test',
  'borderland-arena',
  'borderland-protocol',
  'branding',
  'building-games-web3',
  'canvas-painting',
  'case-files',
  'chain-of-lies',
  'channel-surfing',
  'choreo-showcase',
  'click2-clash',
  'click2cash',
  'commit-kaaviyam',
  'crack-the-code',
  'cypher',
  'deadlock',
  'designers-onboard',
  'digital-detective',
  'dual-dance',
  'duo-dance',
  'electrodes-to-signals',
  'entrepreneurship-talks',
  'episode-zero',
  'escape-room',
  'exchange-effect',
  'film-making',
  'filmfinatics',
  'finance-trading',
  'finverse',
  'foss-treasure-hunt',
  'frame-spot',
  'gaming-event',
  'industrial-automation',
  'load-the-lyrics',
  'make-up-workshop',
  'mlops-workshop',
  'mock-global-summit',
  'modelling',
  'paint-the-town',
  'pcb-design',
  'pcb-workshop',
  'photography-workshop',
  'pixels-to-polygons',
  'prompt-pixel',
  'rap-a-thon',
  'soc-investigation',
  'solo-singing',
  'speedathon',
  'the-90-minute-ceo',
  'treasure-hunt',
  'upside-down-ctf',
  'vision-board-workshop',
];

async function cleanupDuplicates() {
  console.log('🧹 Starting duplicate/legacy events cleanup...\n');

  const eventsRef = db.collection('events');
  let deleted = 0;
  let skipped = 0;

  for (const id of candidateIds) {
    if (allowedIds.has(id)) {
      console.log(`⏭️  Keeping canonical event: ${id}`);
      skipped++;
      continue;
    }

    try {
      console.log(`🗑️  Deleting legacy/duplicate event: ${id}`);
      await eventsRef.doc(id).delete();
      deleted++;
    } catch (error) {
      console.error(`   ❌ Failed to delete ${id}: ${error.message}`);
    }
  }

  console.log('\n✅ Cleanup complete.');
  console.log(`   Deleted: ${deleted}`);
  console.log(`   Kept (canonical): ${skipped}`);
}

cleanupDuplicates()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });

