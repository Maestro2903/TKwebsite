#!/usr/bin/env node

/**
 * Verify Event Timing Updates
 * 
 * Displays all events with their timing information grouped by day
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

async function verifyEventTiming() {
    console.log('🔍 Verifying Event Timing Updates...\n');
    console.log('='.repeat(80));

    const eventsSnapshot = await db.collection('events').orderBy('date').get();

    const eventsByDay = {
        1: [],
        2: [],
        3: [],
        undefined: []
    };

    eventsSnapshot.forEach(doc => {
        const event = doc.data();
        const day = event.day || 'undefined';
        eventsByDay[day].push({
            id: doc.id,
            name: event.name,
            category: event.category,
            date: event.date,
            day: event.day,
            startTime: event.startTime,
            endTime: event.endTime,
            venue: event.venue
        });
    });

    // Display events by day
    for (const [day, events] of Object.entries(eventsByDay)) {
        if (events.length === 0) continue;

        console.log(`\n📅 DAY ${day === 'undefined' ? '(Not Set)' : day} - ${events[0]?.date || 'No Date'}`);
        console.log('-'.repeat(80));

        events.forEach(event => {
            console.log(`\n  📌 ${event.name} (${event.id})`);
            console.log(`     Category: ${event.category}`);
            console.log(`     Venue: ${event.venue || 'Not set'}`);
            console.log(`     Time: ${event.startTime || 'Not set'} ${event.endTime ? `- ${event.endTime}` : ''}`);
        });
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 Summary:');
    console.log(`   Day 1 Events: ${eventsByDay[1].length}`);
    console.log(`   Day 2 Events: ${eventsByDay[2].length}`);
    console.log(`   Day 3 Events: ${eventsByDay[3].length}`);
    console.log(`   Events without day: ${eventsByDay['undefined'].length}`);
    console.log(`   Total Events: ${eventsSnapshot.size}`);
    console.log('='.repeat(80));
}

verifyEventTiming()
    .then(() => {
        console.log('\n✨ Verification complete');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Verification failed:', error);
        process.exit(1);
    });
