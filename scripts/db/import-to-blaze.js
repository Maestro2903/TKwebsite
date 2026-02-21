/**
 * Phase 2: IMPORT local JSON files into the new Blaze Firestore project
 *
 * Reads JSON files from scripts/db/export/ and writes them to the new project.
 * The new project is on Blaze plan so there are no quota limits.
 *
 * Usage: node scripts/db/import-to-blaze.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ─── Configuration ──────────────────────────────────────────────────────────
const EXPORT_DIR = path.resolve(__dirname, 'export');
const BATCH_SIZE = 400;

// ─── Initialize DESTINATION (new Blaze project) ─────────────────────────────
const destServiceAccount = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, '../../cit-takshashila-2026-3fd85-firebase-adminsdk-fbsvc-d557fcbaec.json'),
        'utf8'
    )
);

const app = admin.initializeApp({
    credential: admin.credential.cert(destServiceAccount),
});
const db = app.firestore();
console.log('✓ Connected to DESTINATION: cit-takshashila-2026-3fd85\n');

// ─── Deserialize Firestore data ─────────────────────────────────────────────
function deserializeValue(val) {
    if (val === null || val === undefined) return val;
    if (typeof val === 'object' && val.__type) {
        switch (val.__type) {
            case 'timestamp':
                return new admin.firestore.Timestamp(val._seconds, val._nanoseconds);
            case 'geopoint':
                return new admin.firestore.GeoPoint(val.latitude, val.longitude);
            case 'reference':
                return db.doc(val.path);
            case 'bytes':
                return Buffer.from(val.data, 'base64');
        }
    }
    if (Array.isArray(val)) {
        return val.map(deserializeValue);
    }
    if (typeof val === 'object' && val !== null) {
        const obj = {};
        for (const [k, v] of Object.entries(val)) {
            obj[k] = deserializeValue(v);
        }
        return obj;
    }
    return val;
}

// ─── Import Logic ───────────────────────────────────────────────────────────

async function importDocs(collectionRef, docs, collectionName, depth = 0) {
    const indent = '  '.repeat(depth);
    let totalDocs = 0;
    let batch = db.batch();
    let batchCount = 0;

    for (const doc of docs) {
        const docRef = collectionRef.doc(doc.__id);
        batch.set(docRef, deserializeValue(doc.__data));
        batchCount++;
        totalDocs++;

        if (batchCount >= BATCH_SIZE) {
            await batch.commit();
            console.log(`${indent}  ├─ Committed batch of ${batchCount} docs (total: ${totalDocs})`);
            batch = db.batch();
            batchCount = 0;
        }

        // Handle subcollections
        if (doc.__subcollections) {
            for (const [subcolName, subDocs] of Object.entries(doc.__subcollections)) {
                if (subDocs.length > 0) {
                    console.log(`${indent}  ├─ Subcollection: ${collectionName}/${doc.__id}/${subcolName}`);
                    const subRef = docRef.collection(subcolName);
                    const subCount = await importDocs(subRef, subDocs, subcolName, depth + 1);
                    totalDocs += subCount;
                }
            }
        }
    }

    // Commit remaining
    if (batchCount > 0) {
        await batch.commit();
    }

    return totalDocs;
}

async function main() {
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║  Phase 2: IMPORT JSON files → New Firestore  ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    // Check export directory exists
    if (!fs.existsSync(EXPORT_DIR)) {
        console.error('❌ Export directory not found! Run export-firestore.js first.');
        process.exit(1);
    }

    // Find all JSON files
    const jsonFiles = fs.readdirSync(EXPORT_DIR).filter(f => f.endsWith('.json'));
    if (jsonFiles.length === 0) {
        console.error('❌ No JSON files found in export directory!');
        process.exit(1);
    }

    console.log(`Found ${jsonFiles.length} collection files: ${jsonFiles.map(f => f.replace('.json', '')).join(', ')}\n`);

    const summary = {};

    for (let i = 0; i < jsonFiles.length; i++) {
        const file = jsonFiles[i];
        const collectionName = file.replace('.json', '');
        console.log(`📦 [${i + 1}/${jsonFiles.length}] Importing: ${collectionName}`);

        const filePath = path.join(EXPORT_DIR, file);
        const docs = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (docs.length === 0) {
            console.log(`  └─ (empty, skipping)\n`);
            summary[collectionName] = 0;
            continue;
        }

        const collectionRef = db.collection(collectionName);
        const count = await importDocs(collectionRef, docs, collectionName);
        summary[collectionName] = count;

        console.log(`  └─ ✅ ${count} documents imported\n`);
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════');
    console.log('  IMPORT SUMMARY');
    console.log('═══════════════════════════════════════════════');
    let total = 0;
    for (const [name, count] of Object.entries(summary)) {
        console.log(`  ${name}: ${count} docs`);
        total += count;
    }
    console.log(`  ─────────────────────────────`);
    console.log(`  TOTAL: ${total} documents imported`);
    console.log('═══════════════════════════════════════════════\n');

    await app.delete();
    console.log('✅ Import complete! All data is now in the new Blaze project.\n');
    console.log('Next steps:');
    console.log('  1. Update .env.local with new project credentials');
    console.log('  2. Update .firebaserc');
    console.log('  3. Deploy firestore rules: firebase deploy --only firestore:rules');
    console.log('  4. Deploy indexes: firebase deploy --only firestore:indexes\n');
}

main().catch(err => {
    console.error('\n❌ Import failed:', err.message);
    console.error(err);
    process.exit(1);
});
