#!/usr/bin/env node

/**
 * Update Day 1 Events Script
 * 
 * Updates existing Day 1 events with correct venue/timing/day,
 * creates new events that don't exist yet,
 * and removes SOLO SINGING & LOAD THE LYRICS from Day 1.
 * 
 * Run with: node scripts/db/update-day1-events.js
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
        console.log('🔐 Using FIREBASE_SERVICE_ACCOUNT_KEY from environment...\n');
        try {
            admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountKey)) });
        } catch (error) {
            console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
            process.exit(1);
        }
    } else {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

        if (!projectId || !clientEmail || !privateKey) {
            console.error('❌ Missing Firebase credentials');
            process.exit(1);
        }

        console.log('🔐 Using individual Firebase Admin credentials...\n');
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey
                })
            });
        } catch (error) {
            console.error('❌ Failed to initialize Firebase Admin:', error.message);
            process.exit(1);
        }
    }
}

const db = admin.firestore();

// ╔══════════════════════════════════════════════════════════════╗
// ║  PART 1: Update existing Day 1 events (venue/timing/day)   ║
// ╚══════════════════════════════════════════════════════════════╝
const existingEventUpdates = {
    // ─── Non-Technical Events ───
    'choreo-showcase': {
        startTime: '10:30 AM',
        endTime: '2:00 PM',
        venue: 'PARTHA',
        day: 1,
        date: '2026-02-26',
    },
    'rap-a-thon': {
        startTime: '10:30 AM',
        endTime: '1:00 PM',
        venue: 'OUTER OAT',
        day: 1,
        date: '2026-02-26',
    },
    'treasure-hunt': {
        startTime: '10:30 AM',
        endTime: null,
        venue: 'INNER OAT',
        day: 1,
        date: '2026-02-26',
    },
    'case-files': {
        startTime: '10:30 AM',
        endTime: '2:00 PM',
        venue: 'CLASSROOM',
        day: 1,
        date: '2026-02-26',
    },
    'frame-spot': {
        startTime: '10:30 AM',
        endTime: '2:00 PM',
        venue: 'CAMPUS (ASSEMBLE AT CLASSROOM)',
        day: 1,
        date: '2026-02-26',
    },
    'gaming-event': {
        startTime: null,
        endTime: null,
        venue: 'SH 1 OR PENEE HALL',
        day: 1,
        date: '2026-02-26',
    },
    'filmfinatics': {
        startTime: '12:00 PM',
        endTime: '2:00 PM',
        venue: 'KAVERI',
        day: 1,
        date: '2026-02-26',
    },

    // ─── Technical Events ───
    'upside-down-ctf': {
        startTime: '9:00 AM',
        endTime: '3:00 PM',
        venue: 'Python Lab',
        day: 1,
        date: '2026-02-26',
    },
    'deadlock': {
        startTime: '10:00 AM',
        endTime: null,
        venue: 'Pega Lab',
        day: 1,
        date: '2026-02-26',
    },
    'borderland-protocol': {
        startTime: '9:00 AM',
        endTime: null,
        venue: 'ILP Lab',
        day: 1,
        date: '2026-02-26',
    },
    'exchange-effect': {
        startTime: '9:00 AM',
        endTime: null,
        venue: 'CITIL Lab',
        day: 1,
        date: '2026-02-26',
    },
};

// ╔══════════════════════════════════════════════════════════════╗
// ║  PART 2: Remove SOLO SINGING & LOAD THE LYRICS from Day 1  ║
// ╚══════════════════════════════════════════════════════════════╝
const removeFromDay1 = ['solo-singing', 'load-the-lyrics'];

// ╔══════════════════════════════════════════════════════════════╗
// ║  PART 3: Create NEW events that don't exist in database     ║
// ╚══════════════════════════════════════════════════════════════╝
const newEvents = [
    {
        id: 'entrepreneurship-talks',
        name: 'ENTREPRENEURSHIP TALKS',
        category: 'non_technical',
        type: 'individual',
        date: '2026-02-26',
        day: 1,
        venue: 'CITIL',
        startTime: '10:30 AM',
        endTime: '11:30 AM',
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'Inspiring entrepreneurship talks featuring industry leaders sharing their journey, insights, and strategies for building successful ventures.',
        image: '/images/event/tech/tech%20quest.webp',
    },
    {
        id: 'finance-trading',
        name: 'FINANCE & TRADING',
        category: 'non_technical',
        type: 'individual',
        date: '2026-02-26',
        day: 1,
        venue: 'CITIL',
        startTime: '12:00 PM',
        endTime: '1:30 PM',
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'Dive into the world of finance and trading through interactive sessions, market simulations, and expert-led discussions.',
        image: '/images/event/tech/tech%20quest.webp',
    },
    {
        id: 'modelling',
        name: 'MODELLING',
        category: 'non_technical',
        type: 'individual',
        date: '2026-02-26',
        day: 1,
        venue: 'F5',
        startTime: '11:00 AM',
        endTime: '1:00 PM',
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'Strut your style and confidence on the ramp in this exciting modelling showcase event.',
        image: '/images/event/tech/tech%20quest.webp',
    },
    {
        id: 'commit-kaaviyam',
        name: 'COMMIT KAAVIYAM',
        category: 'technical',
        type: 'individual',
        date: '2026-02-26',
        day: 1,
        venue: 'CIT Classroom',
        startTime: '10:30 AM',
        endTime: '12:30 PM',
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'A creative technical event blending coding with artistic expression through commit-based storytelling.',
        image: '/images/event/tech/tech%20quest.webp',
    },
    {
        id: 'big-data-cse',
        name: 'BIG DATA (CSE)',
        category: 'technical',
        type: 'individual',
        date: '2026-02-26',
        day: 1,
        venue: 'ILP Lab Pega',
        startTime: '1:00 PM',
        endTime: null,
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'Explore the world of big data through hands-on challenges involving data analysis, processing, and visualization.',
        image: '/images/event/tech/tech%20quest.webp',
    },
];

// ╔══════════════════════════════════════════════════════════════╗
// ║  MAIN EXECUTION                                             ║
// ╚══════════════════════════════════════════════════════════════╝
async function updateDay1Events() {
    console.log('🔄 Starting Day 1 event updates...\n');
    console.log('='.repeat(60));

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // ── PART 1: Update existing events ──
    console.log('\n📋 PART 1: Updating existing events with Day 1 data...\n');

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

            console.log(`     ✅ Updated → Day ${timingData.day}, Venue: ${timingData.venue}`);
            if (timingData.startTime) console.log(`        Start: ${timingData.startTime}`);
            if (timingData.endTime) console.log(`        End: ${timingData.endTime}`);

            successCount++;
        } catch (error) {
            console.error(`     ❌ Error: ${error.message}`);
            errorCount++;
            errors.push({ eventId, error: error.message });
        }
    }

    // ── PART 2: Remove SOLO SINGING & LOAD THE LYRICS from Day 1 ──
    console.log('\n📋 PART 2: Removing events from Day 1...\n');

    for (const eventId of removeFromDay1) {
        try {
            console.log(`  📝 Removing from Day 1: ${eventId}`);

            const eventRef = db.collection('events').doc(eventId);
            const eventDoc = await eventRef.get();

            if (!eventDoc.exists) {
                console.log(`     ⚠️  Event not found, skipping...`);
                errorCount++;
                errors.push({ eventId, error: 'Event not found for removal' });
                continue;
            }

            await eventRef.update({
                day: admin.firestore.FieldValue.delete(),
                date: admin.firestore.FieldValue.delete(),
                startTime: admin.firestore.FieldValue.delete(),
                endTime: admin.firestore.FieldValue.delete(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`     ✅ Removed from Day 1 (day/date/timing fields deleted)`);
            successCount++;
        } catch (error) {
            console.error(`     ❌ Error: ${error.message}`);
            errorCount++;
            errors.push({ eventId, error: error.message });
        }
    }

    // ── PART 3: Create new events ──
    console.log('\n📋 PART 3: Creating new events...\n');

    for (const event of newEvents) {
        try {
            console.log(`  📝 Creating: ${event.name} (${event.id})`);

            const eventRef = db.collection('events').doc(event.id);

            // Check if it already exists
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

            console.log(`        Day: ${event.day}, Venue: ${event.venue}`);
            if (event.startTime) console.log(`        Start: ${event.startTime}`);
            if (event.endTime) console.log(`        End: ${event.endTime}`);

            successCount++;
        } catch (error) {
            console.error(`     ❌ Error: ${error.message}`);
            errorCount++;
            errors.push({ eventId: event.id, error: error.message });
        }
    }

    // ── Summary ──
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Day 1 event update complete!\n');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📊 Total operations: ${successCount + errorCount}`);

    if (errors.length > 0) {
        console.log('\n❌ Failed operations:');
        errors.forEach(({ eventId, error }) => {
            console.log(`   - ${eventId}: ${error}`);
        });
    }

    console.log('\n' + '='.repeat(60));
}

// Run
updateDay1Events()
    .then(() => {
        console.log('\n✨ Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error);
        process.exit(1);
    });
