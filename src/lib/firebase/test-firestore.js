import { getAdminFirestore } from './adminApp';

async function testConnection() {
    try {
        console.log('Testing Firestore connection...');
        const db = getAdminFirestore();
        const snap = await db.collection('payments').limit(1).get();
        console.log('Successfully connected to Firestore!');
        console.log(`Found ${snap.size} documents in 'payments' collection.`);

        if (snap.size > 0) {
            console.log('Sample payment record:', JSON.stringify(snap.docs[0].data(), null, 2));
        } else {
            console.log('Warning: No payments found in database.');
        }
    } catch (error) {
        console.error('Firestore connection FAILED:', error);
    }
}

testConnection();
