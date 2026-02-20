#!/usr/bin/env node

/**
 * Update remaining Day 1 Technical Events
 * - Update MLOps workshop venue/timing
 * - Create Pixels to Polygons
 * - Create PCB (ECE/VLSI/ACT)
 * 
 * Run with: node scripts/db/update-day1-tech-extra.js
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

async function run() {
    console.log('🔄 Updating remaining Day 1 technical events...\n');
    let success = 0;

    // 1. Update MLOps workshop venue/timing
    console.log('📝 Updating: mlops-workshop');
    const mlopsRef = db.collection('events').doc('mlops-workshop');
    const mlopsDoc = await mlopsRef.get();
    if (mlopsDoc.exists) {
        await mlopsRef.update({
            venue: 'AI Lab CIT',
            startTime: '11:00 AM',
            day: 1,
            date: '2026-02-26',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('   ✅ Updated → Day 1, Venue: AI Lab CIT, Start: 11:00 AM');
        success++;
    } else {
        console.log('   ⚠️  Not found');
    }

    // 2. Create Pixels to Polygons
    console.log('📝 Creating: pixels-to-polygons');
    await db.collection('events').doc('pixels-to-polygons').set({
        id: 'pixels-to-polygons',
        name: 'PIXELS TO POLYGONS',
        category: 'technical',
        type: 'individual',
        date: '2026-02-26',
        day: 1,
        venue: 'ILP AI/ML Lab',
        startTime: '11:00 AM',
        endTime: null,
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'Transform pixels into polygons in this creative technical challenge bridging digital art and computational geometry.',
        image: '/images/event/tech/tech%20quest.webp',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('   ✅ Created → Day 1, Venue: ILP AI/ML Lab, Start: 11:00 AM');
    success++;

    // 3. Create PCB (ECE/VLSI/ACT)
    console.log('📝 Creating: pcb-design');
    await db.collection('events').doc('pcb-design').set({
        id: 'pcb-design',
        name: 'PCB (ECE/VLSI/ACT)',
        category: 'technical',
        type: 'individual',
        date: '2026-02-26',
        day: 1,
        venue: 'IOT Lab',
        startTime: '12:30 PM',
        endTime: null,
        prizePool: 0,
        allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
        isActive: true,
        description: 'A hands-on PCB design challenge for ECE, VLSI, and ACT students, testing circuit design and implementation skills.',
        image: '/images/event/tech/tech%20quest.webp',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('   ✅ Created → Day 1, Venue: IOT Lab, Start: 12:30 PM');
    success++;

    console.log(`\n🎉 Done! ${success}/3 operations succeeded.`);
}

run()
    .then(() => process.exit(0))
    .catch(err => { console.error('💥 Failed:', err); process.exit(1); });
