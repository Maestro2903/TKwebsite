/**
 * Seed sample data into the NEW Blaze Firestore project for API connectivity testing.
 *
 * Seeds all core collections: users, events, passes, payments, teams, registrations
 * with realistic sample data matching the exact schema.
 *
 * Usage: node scripts/db/seed-test-data-blaze.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ─── Initialize using the new Blaze project service account ─────────────────
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
console.log('✓ Connected to: cit-takshashila-2026-3fd85\n');

// ─── Sample Data ────────────────────────────────────────────────────────────

const TEST_USER_ID = 'test-user-001';
const TEST_PASS_ID = 'test-pass-001';
const TEST_PAYMENT_ID = 'test-payment-001';
const TEST_TEAM_ID = 'test-team-001';

const sampleUsers = [
    {
        id: TEST_USER_ID,
        data: {
            uid: TEST_USER_ID,
            name: 'Test User',
            email: 'testuser@example.com',
            college: 'CIT Chennai',
            phone: '9876543210',
            isOrganizer: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
    },
    {
        id: 'test-organizer-001',
        data: {
            uid: 'test-organizer-001',
            name: 'Test Organizer',
            email: 'organizer@example.com',
            college: 'CIT Chennai',
            phone: '9876543211',
            isOrganizer: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
    },
];

const sampleEvents = [
    {
        id: 'test-solo-singing',
        data: {
            id: 'test-solo-singing',
            name: 'SOLO SINGING',
            category: 'non_technical',
            type: 'individual',
            date: '2026-02-26',
            venue: 'Partha',
            prizePool: 15000,
            allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
            isActive: true,
            description: 'Test event - Solo singing competition',
            image: '/images/event/nontech/loadthelyrics01.jpg',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
    },
    {
        id: 'test-choreo-showcase',
        data: {
            id: 'test-choreo-showcase',
            name: 'CHOREO SHOWCASE',
            category: 'non_technical',
            type: 'group',
            date: '2026-02-26',
            venue: 'Partha',
            prizePool: 35000,
            allowedPassTypes: ['group_events'],
            isActive: true,
            description: 'Test event - Group dance battle',
            image: '/images/event/nontech/CHOREO%20SHOWCASE.webp',
            minMembers: 1,
            maxMembers: 8,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
    },
    {
        id: 'test-deadlock',
        data: {
            id: 'test-deadlock',
            name: 'DEADLOCK',
            category: 'technical',
            type: 'individual',
            date: '2026-02-27',
            venue: 'CSE Labs',
            prizePool: 35000,
            allowedPassTypes: ['day_pass', 'sana_concert'],
            isActive: true,
            description: 'Test event - Coding battle',
            image: '/images/event/tech/deadlock.jpeg',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
    },
];

const samplePayments = [
    {
        id: TEST_PAYMENT_ID,
        data: {
            userId: TEST_USER_ID,
            amount: 499,
            passType: 'day_pass',
            cashfreeOrderId: 'cf_test_order_001',
            status: 'success',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            customerDetails: {
                name: 'Test User',
                email: 'testuser@example.com',
                phone: '9876543210',
            },
            selectedDays: ['2026-02-26', '2026-02-27'],
            selectedEvents: ['test-solo-singing', 'test-deadlock'],
        },
    },
];

const samplePasses = [
    {
        id: TEST_PASS_ID,
        data: {
            userId: TEST_USER_ID,
            passType: 'day_pass',
            amount: 499,
            paymentId: TEST_PAYMENT_ID,
            status: 'paid',
            qrCode: 'data:image/png;base66,TEST_QR_PLACEHOLDER',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            selectedEvents: ['test-solo-singing', 'test-deadlock'],
            selectedDays: ['2026-02-26', '2026-02-27'],
            eventAccess: {
                tech: true,
                nonTech: true,
                proshowDays: [],
                fullAccess: false,
            },
        },
    },
    {
        id: 'test-pass-002',
        data: {
            userId: TEST_USER_ID,
            passType: 'test_pass',
            amount: 0,
            paymentId: 'test-payment-002',
            status: 'paid',
            qrCode: 'data:image/png;base64,TEST_QR_PASS_PLACEHOLDER',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            selectedEvents: [],
            selectedDays: [],
            eventAccess: {
                tech: true,
                nonTech: true,
                proshowDays: ['2026-02-26', '2026-02-27', '2026-02-28'],
                fullAccess: true,
            },
        },
    },
];

const sampleTeams = [
    {
        id: TEST_TEAM_ID,
        data: {
            teamName: 'Test Team Alpha',
            leaderId: TEST_USER_ID,
            passId: 'test-group-pass-001',
            totalMembers: 3,
            totalAmount: 1497,
            members: [
                {
                    memberId: 'member-001',
                    name: 'Test Leader',
                    phone: '9876543210',
                    email: 'leader@example.com',
                    isLeader: true,
                    attendance: {
                        checkedIn: false,
                        checkInTime: null,
                        checkedInBy: null,
                    },
                },
                {
                    memberId: 'member-002',
                    name: 'Test Member 2',
                    phone: '9876543212',
                    email: 'member2@example.com',
                    isLeader: false,
                    attendance: {
                        checkedIn: false,
                        checkInTime: null,
                        checkedInBy: null,
                    },
                },
                {
                    memberId: 'member-003',
                    name: 'Test Member 3',
                    phone: '9876543213',
                    email: 'member3@example.com',
                    isLeader: false,
                    attendance: {
                        checkedIn: false,
                        checkInTime: null,
                        checkedInBy: null,
                    },
                },
            ],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
    },
];

const sampleRegistrations = [
    {
        id: 'test-reg-001',
        data: {
            uid: TEST_USER_ID,
            eventId: 'test-solo-singing',
            passId: TEST_PASS_ID,
            registeredAt: admin.firestore.FieldValue.serverTimestamp(),
        },
    },
];

// ─── Seed Logic ─────────────────────────────────────────────────────────────

async function seedCollection(collectionName, items) {
    console.log(`📦 Seeding: ${collectionName}`);
    const ref = db.collection(collectionName);
    let count = 0;

    for (const item of items) {
        await ref.doc(item.id).set(item.data);
        count++;
        console.log(`  ├─ ✅ ${item.id}`);
    }

    console.log(`  └─ ${count} documents written\n`);
    return count;
}

async function main() {
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║  Seed Test Data → New Blaze Firestore         ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    let total = 0;

    total += await seedCollection('users', sampleUsers);
    total += await seedCollection('events', sampleEvents);
    total += await seedCollection('payments', samplePayments);
    total += await seedCollection('passes', samplePasses);
    total += await seedCollection('teams', sampleTeams);
    total += await seedCollection('registrations', sampleRegistrations);

    console.log('═══════════════════════════════════════════════');
    console.log(`  TOTAL: ${total} sample documents seeded`);
    console.log('═══════════════════════════════════════════════\n');

    await app.delete();
    console.log('✅ Test data seeded! New Blaze Firestore is ready for connectivity testing.\n');
}

main().catch(err => {
    console.error('❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
});
