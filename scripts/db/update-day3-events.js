#!/usr/bin/env node

/**
 * Update Day 3 Events Script
 * 
 * Updates existing Day 3 events with correct venue/timing/day,
 * and creates new events that don't exist yet.
 * 
 * Run with: node scripts/db/update-day3-events.js
 */

const admin = require('firebase-admin');
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
        admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountKey)) });
    } else {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY
            })
        });
    }
}

const db = admin.firestore();

// ╔══════════════════════════════════════════════════════════════╗
// ║  PART 1: Update existing events for Day 3                   ║
// ╚══════════════════════════════════════════════════════════════╝
const existingEventUpdates = {
    // ─── Non-Technical Events ───
    'designers-onboard': {
        startTime: '10:00 AM',
        endTime: '1:00 PM',
        venue: 'DAIMER LAB',
        day: 3,
        date: '2026-02-28',
    },
    'duo-dance': {
        startTime: '11:00 AM',
        endTime: '3:00 PM',
        venue: 'KAVERI',
        day: 3,
        date: '2026-02-28',
    },
    'treasure-hunt': {
        startTime: '10:30 AM',
        endTime: null,
        venue: 'INNER OAT',
        day: 3,
        date: '2026-02-28',
    },
    'canvas-painting': {
        startTime: '10:30 AM',
        endTime: '2:00 PM',
        venue: 'CLASSROOM',
        day: 3,
        date: '2026-02-28',
    },
    'channel-surfing': {
        startTime: '10:30 AM',
        endTime: '12:30 PM',
        venue: 'OUTER OAT',
        day: 3,
        date: '2026-02-28',
    },

    // ─── Technical Events ───
    'speedathon': {
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        venue: 'Partha',
        day: 3,
        date: '2026-02-28',
    },
    'chain-of-lies': {
        startTime: '1:00 PM',
        endTime: null,
        venue: 'CIT Lab',
        day: 3,
        date: '2026-02-28',
    },
    'building-games-web3': {
        startTime: '12:30 PM',
        endTime: null,
        venue: 'ILP Lab pega',
        day: 3,
        date: '2026-02-28',
    },
};

// ╔══════════════════════════════════════════════════════════════╗
// ║  PART 2: Create NEW events for Day 3                        ║
// ╚══════════════════════════════════════════════════════════════╝
const newEvents = [
    // ─── Non-Technical ───
    {
        id: 'make-up-workshop',
        name: 'MAKE UP WORKSHOP',
        category: 'non_technical',
        type: 'individual',
        date: '2026-02-28',
        day: 3,
        venue: 'F5',
        startTime: '11:00 AM',
        endTime: '12:30 PM',
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'Explore techniques and trends in professional makeup through this hands-on workshop led by industry experts.',
        image: '/images/event/tech/tech%20quest.webp',
    },
    {
        id: 'photography-workshop',
        name: 'PHOTOGRAPHY WORKSHOP',
        category: 'non_technical',
        type: 'individual',
        date: '2026-02-28',
        day: 3,
        venue: 'F6',
        startTime: '10:00 AM',
        endTime: '11:30 AM',
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'Learn the fundamentals and advanced techniques of photography, including composition, lighting, and post-processing.',
        image: '/images/event/tech/tech%20quest.webp',
    },
    {
        id: 'branding',
        name: 'BRANDING',
        category: 'non_technical',
        type: 'individual',
        date: '2026-02-28',
        day: 3,
        venue: 'F7',
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'Understand the power of branding and how to build a strong personal or business identity in this creative workshop.',
        image: '/images/event/tech/tech%20quest.webp',
    },

    // ─── Technical ───
    {
        id: 'escape-room',
        name: 'ESCAPE ROOM',
        category: 'technical',
        type: 'individual',
        date: '2026-02-28',
        day: 3,
        venue: 'Pega/AI Lab',
        startTime: '10:30 AM',
        endTime: null,
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'Solve puzzles, decode clues, and escape before time runs out in this immersive technical escape room challenge.',
        image: '/images/event/tech/tech%20quest.webp',
    },
    {
        id: 'soc-investigation',
        name: 'SOC INVESTIGATION',
        category: 'technical',
        type: 'individual',
        date: '2026-02-28',
        day: 3,
        venue: 'Python Lab',
        startTime: '10:30 AM',
        endTime: null,
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'Step into the role of a security analyst and investigate cyber threats in this realistic SOC (Security Operations Center) simulation.',
        image: '/images/event/tech/tech%20quest.webp',
    },
];

// ╔══════════════════════════════════════════════════════════════╗
// ║  MAIN EXECUTION                                             ║
// ╚══════════════════════════════════════════════════════════════╝
async function updateDay3Events() {
    console.log('🔄 Starting Day 3 event updates...\n');
    console.log('='.repeat(60));

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // ── PART 1: Update existing events ──
    console.log('\n📋 PART 1: Updating existing events with Day 3 data...\n');

    for (const [eventId, timingData] of Object.entries(existingEventUpdates)) {
        try {
            console.log(`  📝 Updating: ${eventId}`);
            const eventRef = db.collection('events').doc(eventId);
            const eventDoc = await eventRef.get();

            if (!eventDoc.exists) {
                console.log(`     ⚠️  Event not found in database, skipping...`);
                errorCount++;
                errors.push({ eventId, error: 'Event not found' });
                continue;
            }

            const updateData = {
                day: timingData.day,
                date: timingData.date,
                venue: timingData.venue,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            if (timingData.startTime) updateData.startTime = timingData.startTime;
            if (timingData.endTime) updateData.endTime = timingData.endTime;

            await eventRef.update(updateData);
            console.log(`     ✅ Updated → Venue: ${timingData.venue}, Day: ${timingData.day}`);
            successCount++;
        } catch (error) {
            console.error(`     ❌ Error: ${error.message}`);
            errorCount++;
            errors.push({ eventId, error: error.message });
        }
    }

    // ── PART 2: Create new events ──
    console.log('\n📋 PART 2: Creating new Day 3 events...\n');

    for (const event of newEvents) {
        try {
            console.log(`  📝 Creating: ${event.name} (${event.id})`);
            const eventRef = db.collection('events').doc(event.id);

            const existingDoc = await eventRef.get();
            if (existingDoc.exists) {
                console.log(`     ⚠️  Already exists, updating instead...`);
                const { id, ...updateFields } = event;
                await eventRef.update({
                    ...updateFields,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`     ✅ Updated existing event`);
            } else {
                await eventRef.set({
                    ...event,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                console.log(`     ✅ Created new event`);
            }
            successCount++;
        } catch (error) {
            console.error(`     ❌ Error: ${error.message}`);
            errorCount++;
            errors.push({ eventId: event.id, error: error.message });
        }
    }

    // ── Summary ──
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Day 3 event update complete!\n');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);

    if (errors.length > 0) {
        console.log('\n❌ Failed operations:');
        errors.forEach(({ eventId, error }) => {
            console.log(`   - ${eventId}: ${error}`);
        });
    }

    console.log('\n' + '='.repeat(60));
}

// Run
updateDay3Events()
    .then(() => { console.log('\n✨ Script completed'); process.exit(0); })
    .catch((error) => { console.error('\n💥 Script failed:', error); process.exit(1); });
