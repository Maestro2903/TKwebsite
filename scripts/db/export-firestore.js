/**
 * Phase 1: EXPORT all Firestore data from old project to local JSON files
 *
 * Saves each collection as a separate JSON file in scripts/db/export/
 * Has aggressive retry logic to handle Spark plan quota limits.
 *
 * Usage: node scripts/db/export-firestore.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ─── Configuration ──────────────────────────────────────────────────────────
const EXPORT_DIR = path.resolve(__dirname, 'export');
const PAGE_SIZE = 50;
const MAX_RETRIES = 10;
const BASE_RETRY_DELAY = 15000; // 15s base delay

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry(fn, label) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            return await fn();
        } catch (err) {
            const isQuotaError = err.code === 8 || err.code === 4 ||
                (err.message && (err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('Quota exceeded')));

            if (isQuotaError && attempt < MAX_RETRIES) {
                const delay = BASE_RETRY_DELAY * attempt;
                console.log(`  ⏳ ${label}: Quota hit (attempt ${attempt}/${MAX_RETRIES}), waiting ${delay / 1000}s...`);
                await sleep(delay);
            } else {
                throw err;
            }
        }
    }
}

// ─── Load env ───────────────────────────────────────────────────────────────
function loadEnv() {
    const candidates = [
        path.resolve(__dirname, '../../.env.local'),
        path.resolve(__dirname, '../../.env'),
    ];
    for (const envPath of candidates) {
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split('\n').forEach(line => {
                const match = line.match(/^([^#=]+)=(.*)$/);
                if (match) {
                    let key = match[1].trim();
                    let val = match[2].trim();
                    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                    process.env[key] = val.replace(/\\n/g, '\n');
                }
            });
            console.log(`✓ Loaded env from ${path.basename(envPath)}`);
            return;
        }
    }
}

loadEnv();

// ─── Initialize Firebase (old project) ──────────────────────────────────────
const app = admin.initializeApp({
    credential: admin.credential.cert({
        projectId: 'cit-takshashila-2026',
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    }),
});
const db = app.firestore();
console.log('✓ Connected to SOURCE: cit-takshashila-2026\n');

// ─── Serialize Firestore data ───────────────────────────────────────────────
function serializeValue(val) {
    if (val === null || val === undefined) return val;
    if (val instanceof admin.firestore.Timestamp) {
        return { __type: 'timestamp', _seconds: val.seconds, _nanoseconds: val.nanoseconds };
    }
    if (val instanceof admin.firestore.GeoPoint) {
        return { __type: 'geopoint', latitude: val.latitude, longitude: val.longitude };
    }
    if (val instanceof admin.firestore.DocumentReference) {
        return { __type: 'reference', path: val.path };
    }
    if (Buffer.isBuffer(val)) {
        return { __type: 'bytes', data: val.toString('base64') };
    }
    if (Array.isArray(val)) {
        return val.map(serializeValue);
    }
    if (typeof val === 'object' && val !== null) {
        const obj = {};
        for (const [k, v] of Object.entries(val)) {
            obj[k] = serializeValue(v);
        }
        return obj;
    }
    return val;
}

// ─── Export Logic ───────────────────────────────────────────────────────────

async function exportCollection(collectionRef, collectionName) {
    const docs = [];
    let lastDoc = null;
    let pageNum = 0;

    while (true) {
        pageNum++;
        let query = collectionRef.orderBy('__name__').limit(PAGE_SIZE);
        if (lastDoc) query = query.startAfter(lastDoc);

        const snapshot = await withRetry(
            () => query.get(),
            `${collectionName} page ${pageNum}`
        );

        if (snapshot.empty) break;

        for (const doc of snapshot.docs) {
            const docData = {
                __id: doc.id,
                __data: serializeValue(doc.data()),
                __subcollections: {},
            };

            // Check for subcollections
            const subcollections = await withRetry(
                () => doc.ref.listCollections(),
                `${collectionName}/${doc.id}/subcollections`
            );

            for (const subcol of subcollections) {
                console.log(`    📁 Subcollection: ${collectionName}/${doc.id}/${subcol.id}`);
                const subDocs = await exportCollection(subcol, `${collectionName}/${doc.id}/${subcol.id}`);
                docData.__subcollections[subcol.id] = subDocs;
            }

            docs.push(docData);
        }

        console.log(`  ├─ Page ${pageNum}: read ${snapshot.docs.length} docs (total: ${docs.length})`);
        lastDoc = snapshot.docs[snapshot.docs.length - 1];

        if (snapshot.docs.length < PAGE_SIZE) break;
        await sleep(2000); // pause between pages
    }

    return docs;
}

async function main() {
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║  Phase 1: EXPORT Firestore → JSON files      ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    // Create export directory
    if (!fs.existsSync(EXPORT_DIR)) {
        fs.mkdirSync(EXPORT_DIR, { recursive: true });
    }

    // List collections
    const collections = await withRetry(() => db.listCollections(), 'listCollections');
    console.log(`Found ${collections.length} collections: ${collections.map(c => c.id).join(', ')}\n`);

    const summary = {};

    for (let i = 0; i < collections.length; i++) {
        const col = collections[i];
        console.log(`📦 [${i + 1}/${collections.length}] Exporting: ${col.id}`);

        const docs = await exportCollection(col, col.id);
        summary[col.id] = docs.length;

        // Save to JSON file
        const filePath = path.join(EXPORT_DIR, `${col.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(docs, null, 2));
        console.log(`  └─ ✅ Saved ${docs.length} docs → ${col.id}.json\n`);

        // Pause between collections
        if (i < collections.length - 1) {
            console.log(`  ⏳ Pausing 5s...\n`);
            await sleep(5000);
        }
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════');
    console.log('  EXPORT SUMMARY');
    console.log('═══════════════════════════════════════════════');
    let total = 0;
    for (const [name, count] of Object.entries(summary)) {
        console.log(`  ${name}: ${count} docs`);
        total += count;
    }
    console.log(`  ─────────────────────────────`);
    console.log(`  TOTAL: ${total} documents exported`);
    console.log(`  Files saved to: scripts/db/export/`);
    console.log('═══════════════════════════════════════════════\n');

    await app.delete();
    console.log('✅ Export complete! Now run: node scripts/db/import-to-blaze.js\n');
}

main().catch(err => {
    console.error('\n❌ Export failed:', err.message);
    console.error(err);
    process.exit(1);
});
