const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.resolve(__dirname, '../../.env');
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
    }
}

loadEnv();

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY
    })
});

const db = admin.firestore();
const appId = process.env.CASHFREE_APP_ID;
const secret = process.env.CASHFREE_SECRET_KEY;
const env = process.env.NEXT_PUBLIC_CASHFREE_ENV;
const orderId = process.argv[2];

if (!orderId) {
    console.error('Please provide an orderId: node sync-payment.js <orderId>');
    process.exit(1);
}

const CASHFREE_BASE = env === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

async function syncPayment() {
    console.log(`[Sync] Checking order ${orderId} in Cashfree...`);

    try {
        const cfRes = await fetch(`${CASHFREE_BASE}/orders/${orderId}`, {
            headers: {
                'x-client-id': appId,
                'x-client-secret': secret,
                'x-api-version': '2025-01-01',
            },
        });

        const order = await cfRes.json();
        if (!cfRes.ok) {
            console.error('[Sync] Cashfree error:', order);
            return;
        }

        console.log(`[Sync] Cashfree status: ${order.order_status}`);

        if (order.order_status === 'PAID') {
            const snap = await db.collection('payments').where('cashfreeOrderId', '==', orderId).limit(1).get();
            if (snap.empty) {
                console.error('[Sync] Firestore record not found for this order.');
                return;
            }

            const paymentDoc = snap.docs[0];
            const paymentData = paymentDoc.data();

            if (paymentData.status === 'success') {
                console.log('[Sync] Firestore already shows success. Nothing to do.');
                return;
            }

            console.log('[Sync] Updating Firestore to success...');
            await paymentDoc.ref.update({
                status: 'success',
                updatedAt: new Date()
            });

            if (paymentData.teamId) {
                await db.collection('teams').doc(paymentData.teamId).update({
                    paymentStatus: 'success',
                    updatedAt: new Date()
                });
                console.log(`[Sync] Updated team ${paymentData.teamId} status to success.`);
            }

            console.log('[Sync] Successfully synchronized payment status!');
        } else {
            console.log('[Sync] Order is not paid in Cashfree. No update performed.');
        }
    } catch (err) {
        console.error('[Sync] Error:', err);
    }
}

syncPayment().catch(console.error);
