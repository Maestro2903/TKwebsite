#!/usr/bin/env node

/**
 * Update Event Timing Script
 * 
 * Updates events in Firestore with timing information (start/end times),
 * venue details, and day assignments based on the official schedule.
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

// Event Timing Data from Official Schedule
const eventTimingData = {
    // Day 1 (Feb 26) Non-Technical Events
    'choreo-showcase': {
        startTime: '10:30 AM',
        endTime: '2:00 PM',
        venue: 'PARTHA',
        day: 1
    },
    'rap-a-thon': {
        startTime: '10:30 AM',
        endTime: '1:00 PM',
        venue: 'OUTER OAT',
        day: 1
    },
    'treasure-hunt': {
        startTime: '10:30 AM',
        endTime: null,
        venue: 'INNER OAT',
        day: 1
    },
    'case-files': {
        startTime: '10:30 AM',
        endTime: '2:00 PM',
        venue: 'CLASSROOM',
        day: 1
    },
    'frame-spot': {
        startTime: '10:30 AM',
        endTime: '2:00 PM',
        venue: 'CAMPUS',
        day: 1
    },
    'gaming-event': {
        startTime: null,
        endTime: null,
        venue: 'SH 1 OR PENNAI HALL',
        day: 1
    },
    'solo-singing': {
        startTime: '10:30 AM',
        endTime: '2:00 PM',
        venue: 'KAVERI',
        day: 1
    },

    // Day 2 (Feb 27) Non-Technical Events
    'cypher': {
        startTime: '11:00 AM',
        endTime: '4:00 PM',
        venue: 'OUTER OAT',
        day: 2
    },
    'battle-of-bands': {
        startTime: '10:00 AM',
        endTime: '2:00 PM',
        venue: 'PARTHA',
        day: 2
    },
    'dual-dance': {
        startTime: '10:00 AM',
        endTime: '1:00 PM',
        venue: 'KAVERI',
        day: 2
    },

    // Day 3 (Feb 28) Non-Technical Events
    'designers-onboard': {
        startTime: '10:00 AM',
        endTime: '1:00 PM',
        venue: 'LAB',
        day: 3
    },
    'filmfinatics': {
        startTime: '10:30 AM',
        endTime: '12:30 PM',
        venue: 'KAVERI',
        day: 3
    },
    'paint-the-town': {
        startTime: '10:30 AM',
        endTime: '2:00 PM',
        venue: 'CLASSROOM',
        day: 3
    },
    'channel-surfing': {
        startTime: '10:30 AM',
        endTime: '12:30 PM',
        venue: 'OUTER OAT',
        day: 3
    }
};

async function updateEventTiming() {
    console.log('🔄 Starting event timing update...\n');
    console.log('='.repeat(60));

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const [eventId, timingData] of Object.entries(eventTimingData)) {
        try {
            console.log(`\n📝 Updating: ${eventId}`);

            // Get the event document
            const eventRef = db.collection('events').doc(eventId);
            const eventDoc = await eventRef.get();

            if (!eventDoc.exists) {
                console.log(`  ⚠️  Event not found in database, skipping...`);
                errorCount++;
                errors.push({ eventId, error: 'Event not found' });
                continue;
            }

            // Prepare update data (only include non-null values)
            const updateData = {
                day: timingData.day,
                venue: timingData.venue,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            if (timingData.startTime) {
                updateData.startTime = timingData.startTime;
            }

            if (timingData.endTime) {
                updateData.endTime = timingData.endTime;
            }

            // Update the event
            await eventRef.update(updateData);

            console.log(`  ✅ Updated successfully`);
            console.log(`     Day: ${timingData.day}`);
            console.log(`     Venue: ${timingData.venue}`);
            if (timingData.startTime) console.log(`     Start: ${timingData.startTime}`);
            if (timingData.endTime) console.log(`     End: ${timingData.endTime}`);

            successCount++;
        } catch (error) {
            console.error(`  ❌ Error: ${error.message}`);
            errorCount++;
            errors.push({ eventId, error: error.message });
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Event timing update complete!');
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Total: ${Object.keys(eventTimingData).length}`);

    if (errors.length > 0) {
        console.log('\n❌ Failed events:');
        errors.forEach(({ eventId, error }) => {
            console.log(`   - ${eventId}: ${error}`);
        });
    }

    console.log('='.repeat(60));
}

// Run update
updateEventTiming()
    .then(() => {
        console.log('\n✨ Update script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Update failed:', error);
        process.exit(1);
    });
