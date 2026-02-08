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

const appId = process.env.CASHFREE_APP_ID;
const secret = process.env.CASHFREE_SECRET_KEY;
const env = process.env.NEXT_PUBLIC_CASHFREE_ENV;
const orderId = process.argv[2] || 'order_1770562627490_L2bOQk0r';

const CASHFREE_BASE = env === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

async function checkCashfreeOrder() {
    console.log(`Checking Cashfree Order: ${orderId} in ${env} environment...`);
    console.log(`App ID: ${appId}`);

    try {
        const response = await fetch(`${CASHFREE_BASE}/orders/${orderId}`, {
            headers: {
                'x-client-id': appId,
                'x-client-secret': secret,
                'x-api-version': '2025-01-01',
            },
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Cashfree API error:', data);
            return;
        }

        console.log('Order Details from Cashfree:');
        console.log(` - Order Status: ${data.order_status}`);
        console.log(` - Order Amount: ${data.order_amount}`);
        console.log(` - Payment Session ID: ${data.payment_session_id}`);
        console.log(` - Order Summary:`, data.order_status === 'PAID' ? 'SUCCESS' : 'NOT PAID YET');
    } catch (error) {
        console.error('Network error checking Cashfree:', error);
    }
}

checkCashfreeOrder();
