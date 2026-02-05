
const admin = require('firebase-admin');

// Handle both formats of credentials
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (serviceAccountKey) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountKey))
    });
} else if (clientEmail && privateKey) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        })
    });
}

const db = admin.firestore();

async function listUsers() {
    const snapshot = await db.collection('users').get();
    if (snapshot.empty) {
        console.log('No users found.');
        return;
    }
    snapshot.forEach(doc => {
        console.log(JSON.stringify({ id: doc.id, ...doc.data() }));
    });
}

listUsers().catch(console.error);
