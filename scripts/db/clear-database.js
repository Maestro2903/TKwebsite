require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

let credential;

if (serviceAccountKey) {
  credential = admin.credential.cert(JSON.parse(serviceAccountKey));
} else if (clientEmail && privateKey) {
  credential = admin.credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  });
} else {
  console.error('❌ Firebase Admin credentials missing');
  process.exit(1);
}

admin.initializeApp({ credential });

const db = admin.firestore();

async function deleteCollection(collectionName) {
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    console.log(`✓ ${collectionName}: already empty`);
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`✓ ${collectionName}: deleted ${snapshot.size} documents`);
}

async function clearDatabase() {
  console.log('Starting database cleanup...\n');
  
  const collections = ['passes', 'payments', 'teams', 'users'];
  
  for (const collection of collections) {
    await deleteCollection(collection);
  }
  
  console.log('\n✅ Database cleared successfully!');
  process.exit(0);
}

clearDatabase().catch((error) => {
  console.error('❌ Error clearing database:', error);
  process.exit(1);
});
