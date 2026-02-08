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

const CASHFREE_BASE =
    process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';

async function checkOrderStatus(orderId) {
    const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID || process.env.CASHFREE_APP_ID;
    const secret = process.env.CASHFREE_SECRET_KEY;

    if (!appId || !secret) {
        console.error('Missing Cashfree credentials');
        return;
    }

    console.log(`Checking Cashfree order status for: ${orderId}`);
    console.log(`Using base URL: ${CASHFREE_BASE}`);

    try {
        const response = await fetch(`${CASHFREE_BASE}/orders/${orderId}`, {
            headers: {
                'x-client-id': appId,
                'x-client-secret': secret,
                'x-api-version': '2025-01-01',
            },
        });

        if (!response.ok) {
            console.error(`Cashfree API error: ${response.status}`);
            const text = await response.text();
            console.error('Response:', text);
            return;
        }

        const order = await response.json();
        console.log('\n=== Cashfree Order Details ===');
        console.log(`Order ID: ${order.order_id}`);
        console.log(`Order Status: ${order.order_status}`);
        console.log(`Order Amount: ${order.order_amount}`);
        console.log(`Order Currency: ${order.order_currency}`);
        console.log(`Created At: ${order.created_at}`);
        if (order.payment_link) {
            console.log(`Payment Link: ${order.payment_link}`);
        }
        console.log('\nFull response:', JSON.stringify(order, null, 2));
    } catch (error) {
        console.error('Error checking order status:', error);
    }
}

// Get order ID from command line argument
const orderId = process.argv[2];
if (!orderId) {
    console.error('Usage: node check-cashfree-order-status.js <order_id>');
    process.exit(1);
}

checkOrderStatus(orderId).catch(console.error);
