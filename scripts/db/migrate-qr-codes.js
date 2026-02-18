#!/usr/bin/env node

/**
 * QR Code Migration Script
 * 
 * Regenerates all existing passes with encrypted QR codes.
 * This script:
 * 1. Fetches all passes from Firebase
 * 2. For each pass, fetches user data
 * 3. Applies default events if missing
 * 4. Generates new encrypted QR code
 * 5. Updates pass document in Firebase
 */

const admin = require('firebase-admin');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Load environment variables
function loadEnv() {
    const envFiles = [
        path.resolve(__dirname, '../../.env.local'),
        path.resolve(__dirname, '../../.env')
    ];

    for (const envPath of envFiles) {
        if (fs.existsSync(envPath)) {
            console.log(`📄 Loading environment from: ${path.basename(envPath)}`);
            const content = fs.readFileSync(envPath, 'utf8');
            content.split('\n').forEach(line => {
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

// Initialize Firebase Admin
if (!admin.apps.length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
        console.log('🔐 Using FIREBASE_SERVICE_ACCOUNT_KEY from environment...\n');
        try {
            admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountKey)) });
        } catch (error) {
            console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
            process.exit(1);
        }
    } else {
        // Use individual environment variables
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

        if (!projectId || !clientEmail || !privateKey) {
            console.error('❌ Missing Firebase credentials. Please set either:');
            console.error('   - FIREBASE_SERVICE_ACCOUNT_KEY (full JSON), or');
            console.error('   - NEXT_PUBLIC_FIREBASE_PROJECT_ID + FIREBASE_ADMIN_CLIENT_EMAIL + FIREBASE_ADMIN_PRIVATE_KEY');
            process.exit(1);
        }

        console.log('🔐 Using individual Firebase Admin credentials...\n');
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: projectId,
                    clientEmail: clientEmail,
                    privateKey: privateKey
                })
            });
        } catch (error) {
            console.error('❌ Failed to initialize Firebase Admin:', error.message);
            process.exit(1);
        }
    }
}


const db = admin.firestore();

// Import encryption utility (using dynamic import for ES module)
let encryptQRData;

// Pass type to event mapping (based on allowedPassTypes from events collection)
const PASS_TYPE_EVENTS = {
    'day_pass': [
        'choreo-showcase', 'rap-a-thon', 'solo-singing', 'frame-spot',
        'battle-of-bands', 'cypher', 'case-files',
        'duo-dance', 'paint-the-town', 'filmfinatics', 'channel-surfing',
        'upside-down-ctf', 'mlops-workshop',
        'deadlock', 'crack-the-code', 'mock-global-summit',
        'prompt-pixel', 'model-mastery',
        'building-games-web3', 'chain-of-lies', 'exchange-effect',
        'the-90-minute-ceo', 'astrotrack', 'gaming-event', 'designers-onboard'
    ],
    'proshow': [
        'choreo-showcase', 'rap-a-thon', 'solo-singing', 'frame-spot',
        'duo-dance', 'paint-the-town', 'filmfinatics', 'channel-surfing',
        'upside-down-ctf', 'mlops-workshop',
        'prompt-pixel', 'model-mastery',
        'the-90-minute-ceo', 'astrotrack', 'designers-onboard'
    ],
    'sana_concert': [
        'choreo-showcase', 'rap-a-thon', 'solo-singing', 'frame-spot',
        'battle-of-bands', 'cypher', 'case-files',
        'duo-dance', 'paint-the-town', 'filmfinatics', 'channel-surfing',
        'upside-down-ctf', 'mlops-workshop',
        'deadlock', 'crack-the-code', 'mock-global-summit',
        'prompt-pixel', 'model-mastery',
        'treasure-hunt', 'foss-treasure-hunt', 'borderland-protocol',
        'building-games-web3', 'chain-of-lies', 'exchange-effect',
        'the-90-minute-ceo', 'astrotrack', 'gaming-event', 'designers-onboard'
    ],
    'group_events': [
        'treasure-hunt', 'foss-treasure-hunt', 'borderland-protocol', 'exchange-effect'
    ],
    'test_pass': [
        'choreo-showcase', 'rap-a-thon', 'solo-singing', 'frame-spot',
        'battle-of-bands', 'cypher', 'case-files',
        'duo-dance', 'paint-the-town', 'filmfinatics', 'channel-surfing',
        'upside-down-ctf', 'mlops-workshop',
        'deadlock', 'crack-the-code', 'mock-global-summit',
        'prompt-pixel', 'model-mastery',
        'treasure-hunt', 'foss-treasure-hunt', 'borderland-protocol',
        'building-games-web3', 'chain-of-lies', 'exchange-effect',
        'the-90-minute-ceo', 'astrotrack', 'gaming-event', 'designers-onboard'
    ]
};

async function migratePass(passDoc) {
    const passData = passDoc.data();
    const passId = passDoc.id;

    console.log(`\n📦 Processing: ${passId}`);
    console.log(`   Pass Type: ${passData.passType}`);

    // Fetch user data
    const userDoc = await db.collection('users').doc(passData.userId).get();
    if (!userDoc.exists) {
        console.error(`  ❌ User not found for pass ${passId}`);
        return { success: false, error: 'User not found' };
    }
    const userData = userDoc.data();

    // Determine events (apply defaults if missing)
    let events = passData.selectedEvents || [];
    if (events.length === 0) {
        events = PASS_TYPE_EVENTS[passData.passType] || [];
        console.log(`  📝 Applied ${events.length} default events for ${passData.passType}`);
    } else {
        console.log(`  ✓ Using existing ${events.length} selected events`);
    }

    // Determine days (apply defaults if missing)
    let days = passData.selectedDays || [];
    if (days.length === 0) {
        days = ['2026-02-26', '2026-02-27', '2026-02-28'];
        console.log(`  📝 Applied default days: ${days.join(', ')}`);
    } else {
        console.log(`  ✓ Using existing days: ${days.join(', ')}`);
    }

    // Prepare QR data
    let qrData;

    if (passData.passType === 'group_events' && passData.teamSnapshot) {
        // Group event - include team members
        console.log(`  👥 Group event with team: ${passData.teamSnapshot.teamName}`);
        qrData = {
            id: passId,
            passType: passData.passType,
            teamName: passData.teamSnapshot.teamName,
            members: passData.teamSnapshot.members.map(m => ({
                name: m.name,
                isLeader: m.isLeader
            })),
            events: events,
            days: days
        };
    } else {
        // Individual pass
        console.log(`  👤 Individual pass for: ${userData.name}`);
        qrData = {
            id: passId,
            name: userData.name,
            passType: passData.passType,
            events: events,
            days: days
        };
    }

    // Encrypt QR data
    const encryptedData = encryptQRData(qrData);
    console.log(`  🔐 Encrypted data length: ${encryptedData.length} characters`);

    // Generate new QR code
    const newQrCode = await QRCode.toDataURL(encryptedData, {
        errorCorrectionLevel: 'H',
        width: 400
    });

    // Update pass document
    await passDoc.ref.update({
        qrCode: newQrCode,
        selectedEvents: events,
        selectedDays: days,
        migratedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`  ✅ Migrated successfully`);
    return { success: true };
}

async function migrateAllPasses() {
    console.log('🔄 Starting QR code migration...\n');
    console.log('='.repeat(60));

    // Check encryption key
    if (!process.env.QR_ENCRYPTION_KEY) {
        console.error('❌ QR_ENCRYPTION_KEY not found in environment variables');
        console.error('   Please add it to your .env.local file');
        process.exit(1);
    }

    if (process.env.QR_ENCRYPTION_KEY.length !== 32) {
        console.error(`❌ QR_ENCRYPTION_KEY must be exactly 32 characters`);
        console.error(`   Current length: ${process.env.QR_ENCRYPTION_KEY.length}`);
        process.exit(1);
    }

    console.log('✓ Encryption key validated (32 characters)\n');

    // Load encryption module
    try {
        const encryptionModule = require('../../src/lib/crypto/qrEncryption.ts');
        encryptQRData = encryptionModule.encryptQRData;
        console.log('✓ Encryption module loaded\n');
    } catch (error) {
        console.error('❌ Failed to load encryption module:', error.message);
        process.exit(1);
    }

    // Fetch all passes
    const snapshot = await db.collection('passes').get();
    console.log(`Found ${snapshot.size} passes to migrate\n`);
    console.log('='.repeat(60));

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const doc of snapshot.docs) {
        try {
            const result = await migratePass(doc);
            if (result.success) {
                successCount++;
            } else {
                errorCount++;
                errors.push({ passId: doc.id, error: result.error });
            }
        } catch (error) {
            console.error(`  ❌ Error: ${error.message}`);
            errorCount++;
            errors.push({ passId: doc.id, error: error.message });
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration complete!');
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Total: ${snapshot.size}`);

    if (errors.length > 0) {
        console.log('\n❌ Failed passes:');
        errors.forEach(({ passId, error }) => {
            console.log(`   - ${passId}: ${error}`);
        });
    }

    console.log('='.repeat(60));
}

// Run migration
migrateAllPasses()
    .then(() => {
        console.log('\n✨ Migration script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Migration failed:', error);
        process.exit(1);
    });
