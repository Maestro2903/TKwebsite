/**
 * Migration Script: cit-takshashila-2026 (Spark) → cit-takshashila-2026-3fd85 (Blaze)
 *
 * Copies ALL Firestore collections & documents (preserving document IDs)
 * from the old project to the new project.
 *
 * Includes retry logic with exponential backoff to handle quota limits on Spark plan.
 *
 * Usage: node scripts/db/migrate-to-blaze.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ─── Configuration ──────────────────────────────────────────────────────────
const BATCH_SIZE = 100;           // Smaller batches for writes
const PAGE_SIZE = 100;            // Read documents in pages
const DELAY_BETWEEN_COLLECTIONS = 3000; // 3s pause between collections
const DELAY_BETWEEN_PAGES = 2000;       // 2s pause between read pages
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY = 10000;   // 10s initial retry (quota resets need time)

// ─── Helpers ────────────────────────────────────────────────────────────────
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry(fn, label) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            return await fn();
        } catch (err) {
            const isQuotaError = err.code === 8 || err.code === 4 ||
                (err.message && err.message.includes('RESOURCE_EXHAUSTED')) ||
                (err.message && err.message.includes('Quota exceeded'));

            if (isQuotaError && attempt < MAX_RETRIES) {
                const delay = BASE_RETRY_DELAY * attempt; // Linear backoff: 10s, 20s, 30s...
                console.log(`  ⏳ ${label}: Quota hit (attempt ${attempt}/${MAX_RETRIES}), waiting ${delay / 1000}s...`);
                await sleep(delay);
            } else {
                throw err;
            }
        }
    }
}

// ─── Load .env.local for SOURCE (old) credentials ───────────────────────────
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
    console.warn('⚠ No .env file found, using existing process.env');
}

loadEnv();

// ─── Initialize SOURCE (old project) ────────────────────────────────────────
const sourceApp = admin.initializeApp(
    {
        credential: admin.credential.cert({
            projectId: 'cit-takshashila-2026',
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
        }),
    },
    'source'
);
const sourceDb = sourceApp.firestore();
console.log('✓ Connected to SOURCE: cit-takshashila-2026');

// ─── Initialize DESTINATION (new Blaze project) ─────────────────────────────
const destServiceAccount = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, '../../cit-takshashila-2026-3fd85-firebase-adminsdk-fbsvc-d557fcbaec.json'),
        'utf8'
    )
);

const destApp = admin.initializeApp(
    {
        credential: admin.credential.cert(destServiceAccount),
    },
    'destination'
);
const destDb = destApp.firestore();
console.log('✓ Connected to DESTINATION: cit-takshashila-2026-3fd85');

// ─── Migration Logic ────────────────────────────────────────────────────────

/**
 * Copy all documents from a source collection to destination using pagination.
 * Preserves document IDs. Recursively copies subcollections.
 */
async function migrateCollection(sourceCollRef, destCollRef, collectionName, depth = 0) {
    const indent = '  '.repeat(depth);
    let totalDocs = 0;
    let lastDoc = null;
    let pageNum = 0;

    while (true) {
        pageNum++;

        // Build paginated query
        let query = sourceCollRef.orderBy('__name__').limit(PAGE_SIZE);
        if (lastDoc) {
            query = query.startAfter(lastDoc);
        }

        // Read a page with retry
        const snapshot = await withRetry(
            () => query.get(),
            `${collectionName} page ${pageNum}`
        );

        if (snapshot.empty) {
            if (pageNum === 1) {
                console.log(`${indent}  └─ (empty collection)`);
            }
            break;
        }

        // Write docs in batches
        let batch = destDb.batch();
        let batchCount = 0;

        for (const doc of snapshot.docs) {
            const destDocRef = destCollRef.doc(doc.id);
            batch.set(destDocRef, doc.data());
            batchCount++;
            totalDocs++;

            if (batchCount >= BATCH_SIZE) {
                await withRetry(
                    () => batch.commit(),
                    `${collectionName} write batch`
                );
                console.log(`${indent}  ├─ Wrote ${batchCount} docs (total: ${totalDocs})`);
                batch = destDb.batch();
                batchCount = 0;
            }
        }

        // Commit remaining
        if (batchCount > 0) {
            await withRetry(
                () => batch.commit(),
                `${collectionName} write batch`
            );
            console.log(`${indent}  ├─ Wrote ${batchCount} docs (total: ${totalDocs})`);
        }

        // Handle subcollections for each doc
        for (const doc of snapshot.docs) {
            const subcollections = await withRetry(
                () => doc.ref.listCollections(),
                `${collectionName}/${doc.id} subcollections`
            );

            for (const subcol of subcollections) {
                console.log(`${indent}  ├─ Subcollection: ${collectionName}/${doc.id}/${subcol.id}`);
                const subDestRef = destCollRef.doc(doc.id).collection(subcol.id);
                const subCount = await migrateCollection(
                    doc.ref.collection(subcol.id),
                    subDestRef,
                    subcol.id,
                    depth + 1
                );
                totalDocs += subCount;
            }
        }

        // Update cursor for next page
        lastDoc = snapshot.docs[snapshot.docs.length - 1];

        // If we got fewer docs than page size, we're done
        if (snapshot.docs.length < PAGE_SIZE) {
            break;
        }

        // Pause between pages to respect quota
        await sleep(DELAY_BETWEEN_PAGES);
    }

    return totalDocs;
}

async function migrate() {
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║  Firebase Migration: Spark → Blaze           ║');
    console.log('║  (with rate limiting & retry)                 ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    // List all top-level collections
    const collections = await withRetry(
        () => sourceDb.listCollections(),
        'listCollections'
    );
    const collectionNames = collections.map(c => c.id);
    console.log(`Found ${collectionNames.length} collections: ${collectionNames.join(', ')}\n`);

    const results = {};

    for (let i = 0; i < collections.length; i++) {
        const col = collections[i];
        console.log(`📦 [${i + 1}/${collections.length}] Migrating: ${col.id}`);

        const count = await migrateCollection(
            sourceDb.collection(col.id),
            destDb.collection(col.id),
            col.id
        );
        results[col.id] = count;
        console.log(`  └─ ✅ ${count} documents migrated\n`);

        // Pause between collections
        if (i < collections.length - 1) {
            console.log(`  ⏳ Pausing ${DELAY_BETWEEN_COLLECTIONS / 1000}s before next collection...\n`);
            await sleep(DELAY_BETWEEN_COLLECTIONS);
        }
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════');
    console.log('  MIGRATION SUMMARY');
    console.log('═══════════════════════════════════════════════');
    let totalAll = 0;
    for (const [name, count] of Object.entries(results)) {
        console.log(`  ${name}: ${count} docs`);
        totalAll += count;
    }
    console.log(`  ─────────────────────────────`);
    console.log(`  TOTAL: ${totalAll} documents migrated`);
    console.log('═══════════════════════════════════════════════\n');

    await sourceApp.delete();
    await destApp.delete();

    console.log('✅ Migration complete! Now update .env.local to point to the new project.\n');
}

migrate().catch(err => {
    console.error('\n❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
});
