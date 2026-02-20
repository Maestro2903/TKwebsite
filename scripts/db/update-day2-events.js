#!/usr/bin/env node

/**
 * Update Day 2 Events Script
 * 
 * Updates existing Day 2 events with correct venue/timing/day,
 * creates new events that don't exist yet.
 * 
 * Run with: node scripts/db/update-day2-events.js
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
// ║  PART 1: Update existing events for Day 2                   ║
// ╚══════════════════════════════════════════════════════════════╝
const existingEventUpdates = {
    // ─── Non-Technical Events ───
    'cypher': {
        startTime: '11:00 AM',
        endTime: '4:00 PM',
        venue: 'OUTER OAT',
        day: 2,
        date: '2026-02-27',
    },
    'load-the-lyrics': {
        startTime: '10:30 AM',
        endTime: '1:00 PM',
        venue: 'CLASSROOM',
        day: 2,
        date: '2026-02-27',
    },
    'battle-of-bands': {
        startTime: '10:00 AM',
        endTime: '2:00 PM',
        venue: 'PARTHA',
        day: 2,
        date: '2026-02-27',
    },
    'solo-singing': {
        startTime: '10:00 AM',
        endTime: '1:00 PM',
        venue: 'KAVERI',
        day: 2,
        date: '2026-02-27',
    },

    // ─── Technical Events ───
    'prompt-pixel': {
        startTime: '1:00 PM',
        endTime: null,
        venue: 'AI Lab',
        day: 2,
        date: '2026-02-27',
    },
    'mock-global-summit': {
        startTime: '9:00 AM',
        endTime: null,
        venue: 'Pennai Hall',
        day: 2,
        date: '2026-02-27',
    },
    'astrotrack': {
        startTime: '9:00 AM',
        endTime: '10:30 AM',
        venue: 'Diamler LAB',
        day: 2,
        date: '2026-02-27',
    },
};

// ╔══════════════════════════════════════════════════════════════╗
// ║  PART 2: Create NEW events for Day 2                        ║
// ╚══════════════════════════════════════════════════════════════╝
const newEvents = [
    // ─── Non-Technical ───
    {
        id: 'film-making',
        name: 'FILM MAKING',
        category: 'non_technical',
        type: 'group',
        date: '2026-02-27',
        day: 2,
        venue: 'F5',
        startTime: '10:30 AM',
        endTime: '12:30 PM',
        prizePool: 0,
        allowedPassTypes: ['group_events', 'day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'Unleash your creativity by producing a short film within a limited timeframe, showcasing storytelling, direction, and editing skills.',
        image: '/images/event/tech/tech%20quest.webp',
        minMembers: 2,
        maxMembers: 10,
    },
    {
        id: 'vision-board-workshop',
        name: 'VISION BOARD WORKSHOP',
        category: 'non_technical',
        type: 'individual',
        date: '2026-02-27',
        day: 2,
        venue: 'F6',
        startTime: '11:30 AM',
        endTime: '1:00 PM',
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'Design your future through a creative vision board workshop — map your goals, dreams, and aspirations visually.',
        image: '/images/event/tech/tech%20quest.webp',
    },

    // ─── Technical ───
    {
        id: 'digital-detective',
        name: 'DIGITAL DETECTIVE',
        category: 'technical',
        type: 'individual',
        date: '2026-02-27',
        day: 2,
        venue: 'CIT Lab (CS)',
        startTime: '10:00 AM',
        endTime: null,
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'Put your digital forensics and investigative skills to the test by solving cyber mysteries and uncovering hidden evidence.',
        image: '/images/event/tech/tech%20quest.webp',
    },
    {
        id: 'click2cash',
        name: 'CLICK2CASH',
        category: 'technical',
        type: 'individual',
        date: '2026-02-27',
        day: 2,
        venue: 'CITIL',
        startTime: '11:30 AM',
        endTime: null,
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'Learn the art of turning digital clicks into cash through this interactive session on digital marketing and monetization strategies.',
        image: '/images/event/tech/tech%20quest.webp',
    },
    {
        id: 'industrial-automation',
        name: 'INDUSTRIAL AUTOMATION (MCT)',
        category: 'technical',
        type: 'individual',
        date: '2026-02-27',
        day: 2,
        venue: 'IA Lab',
        startTime: '11:00 AM',
        endTime: null,
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'Explore the world of industrial automation through hands-on challenges involving PLC programming, sensors, and control systems.',
        image: '/images/event/tech/tech%20quest.webp',
    },
    {
        id: 'aero-modelling',
        name: 'AERO MODELLING (CIVIL/MECH/EEE)',
        category: 'technical',
        type: 'individual',
        date: '2026-02-27',
        day: 2,
        venue: 'Drone CoE',
        startTime: '12:00 PM',
        endTime: null,
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'Design, build, and fly aero models in this exciting hands-on challenge for engineering enthusiasts.',
        image: '/images/event/tech/tech%20quest.webp',
    },
    {
        id: 'electrodes-to-signals',
        name: 'ELECTRODES TO SIGNALS: BIOPAC (BME)',
        category: 'technical',
        type: 'individual',
        date: '2026-02-27',
        day: 2,
        venue: 'ILP 3rd Floor Last Lab',
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'A biomedical engineering workshop exploring biosignal acquisition and analysis using BIOPAC systems — from electrodes to digital signals.',
        image: '/images/event/tech/tech%20quest.webp',
    },
];

// ╔══════════════════════════════════════════════════════════════╗
// ║  MAIN EXECUTION                                             ║
// ╚══════════════════════════════════════════════════════════════╝
async function updateDay2Events() {
    console.log('🔄 Starting Day 2 event updates...\n');
    console.log('='.repeat(60));

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // ── PART 1: Update existing events ──
    console.log('\n📋 PART 1: Updating existing events with Day 2 data...\n');

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

    // ── NOTE: Multi-day events ──
    console.log('\n📋 NOTE: Multi-day events (already set to Day 1, also in Day 2):');
    console.log('   - treasure-hunt → INNER OAT, 10:30 AM (keeping Day 1 as primary)');
    console.log('   - gaming-event → SH 1 OR PENNAI HALL (keeping Day 1 as primary)\n');

    // ── PART 2: Create new events ──
    console.log('📋 PART 2: Creating new Day 2 events...\n');

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
    console.log('🎉 Day 2 event update complete!\n');
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
updateDay2Events()
    .then(() => { console.log('\n✨ Script completed'); process.exit(0); })
    .catch((error) => { console.error('\n💥 Script failed:', error); process.exit(1); });
