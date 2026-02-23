#!/usr/bin/env node

/**
 * Seed mockSummitCountries collection for Mock Global Summit country selection.
 * Schema: { name, code, assignedTo: null, assignedAt: null }
 * Run with: node scripts/db/seed-mock-summit-countries.js
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

/** Display name -> countryId (lowercase, hyphenated) */
function toCountryId(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const COUNTRY_NAMES = [
  'United States',
  'China',
  'Taiwan',
  'Japan',
  'South Korea',
  'Germany',
  'France',
  'United Kingdom',
  'India',
  'Singapore',
  'Netherlands',
  'Italy',
  'Canada',
  'Australia',
  'Vietnam',
  'Malaysia',
  'Thailand',
  'Philippines',
  'Indonesia',
  'Brazil',
  'Russia',
  'Mexico',
  'Spain',
  'Belgium',
  'Sweden',
  'Switzerland',
  'Finland',
  'Norway',
  'Denmark',
  'Poland',
  'Turkey',
  'United Arab Emirates',
  'Saudi Arabia',
  'New Zealand',
  'Israel',
  'Argentina',
  'Chile',
  'Colombia',
  'Egypt',
  'Nigeria',
  'Qatar',
  'European Union',
  'SCO',
];

async function main() {
  const col = db.collection('mockSummitCountries');
  let created = 0;
  for (const name of COUNTRY_NAMES) {
    const countryId = toCountryId(name);
    const code = countryId.replace(/-/g, '').toUpperCase().slice(0, 3);
    await col.doc(countryId).set({
      name,
      code,
      assignedTo: null,
      assignedAt: null,
    });
    created++;
    console.log(`  ✅ ${name} (${countryId})`);
  }
  console.log(`\n🎉 Seeded ${created} countries.`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
