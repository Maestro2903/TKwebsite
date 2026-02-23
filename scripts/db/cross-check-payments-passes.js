#!/usr/bin/env node
/**
 * Cross-check payments collection vs passes collection.
 * Finds payments that have no corresponding pass (by paymentId / orderId).
 * Optionally opens callback URL (by calling verify API) to create missing passes.
 *
 * Usage:
 *   node scripts/db/cross-check-payments-passes.js
 *   node scripts/db/cross-check-payments-passes.js --fix
 *   node scripts/db/cross-check-payments-passes.js --fix --base-url https://yoursite.com
 *
 * --fix     : For each payment missing a pass, call fix-stuck-payment API (requires --base-url or NEXT_PUBLIC_APP_URL).
 * --base-url: Base URL of the app (e.g. https://cittakshashila.org). Used for API calls when --fix.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envFiles = [
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../.env.local'),
  ];
  for (const envPath of envFiles) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach((line) => {
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
}

loadEnv();

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (serviceAccountKey) {
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountKey)) });
} else {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

function getOrderId(paymentDoc) {
  const id = paymentDoc.id;
  const data = paymentDoc.data();
  return data.cashfreeOrderId || id;
}

async function crossCheck(opts) {
  const { fix, baseUrl } = opts;

  const paymentsSnap = await db.collection('payments').get();
  const payments = paymentsSnap.docs.map((d) => ({ id: d.id, ref: d.ref, data: d.data() }));

  const passesSnap = await db.collection('passes').get();
  const passByPaymentId = new Map();
  passesSnap.docs.forEach((d) => {
    const paymentId = d.data().paymentId;
    if (paymentId) passByPaymentId.set(paymentId, { id: d.id, data: d.data() });
  });

  const withPass = [];
  const withoutPass = [];

  for (const p of payments) {
    const orderId = p.data.cashfreeOrderId || p.id;
    const pass = passByPaymentId.get(orderId);
    if (pass) {
      withPass.push({ paymentId: p.id, orderId, passId: pass.id, status: p.data.status });
    } else {
      withoutPass.push({
        paymentId: p.id,
        orderId,
        status: p.data.status,
        userId: p.data.userId,
        passType: p.data.passType,
        amount: p.data.amount,
      });
    }
  }

  console.log('\n=== Payments vs Passes cross-check ===\n');
  console.log(`Total payments: ${payments.length}`);
  console.log(`With pass:     ${withPass.length}`);
  console.log(`Without pass:  ${withoutPass.length}`);

  if (withoutPass.length === 0) {
    console.log('\nAll payments have a matching pass.\n');
    return;
  }

  const withoutPassSuccess = withoutPass.filter((r) => r.status === 'success');
  if (withoutPassSuccess.length > 0) {
    console.log(`  (${withoutPassSuccess.length} of these have status 'success' — use --fix to generate pass/QR for them)\n`);
  }

  console.log('--- Payments WITHOUT a pass ---\n');
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://cittakshashila.org';
  const callbackBase = base.replace(/\/$/, '');

  for (const row of withoutPass) {
    const callbackUrl = `${callbackBase}/payment/callback?order_id=${encodeURIComponent(row.orderId)}`;
    console.log(`  orderId:    ${row.orderId}`);
    console.log(`  paymentId:  ${row.paymentId}`);
    console.log(`  status:     ${row.status}`);
    console.log(`  userId:     ${row.userId}`);
    console.log(`  passType:   ${row.passType}`);
    console.log(`  amount:     ${row.amount}`);
    console.log(`  Callback URL (open in browser to trigger verify):`);
    console.log(`    ${callbackUrl}`);
    console.log('');
  }

  // Only generate pass/QR for payments without pass when status is 'success'
  const toFix = withoutPass.filter((row) => row.status === 'success');
  if (fix && toFix.length > 0) {
    const apiBase = callbackBase;
    console.log(`\n--- Generating pass (QR) for ${toFix.length} payment(s) with status success ---\n`);

    for (const row of toFix) {
      const url = `${apiBase}/api/admin/fix-stuck-payment`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: row.orderId }),
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok && body.success) {
          console.log(`  [OK] ${row.orderId}  passCreated: ${body.passCreated}`);
        } else {
          console.log(`  [FAIL] ${row.orderId}  ${res.status}  ${body.error || res.statusText}`);
        }
      } catch (err) {
        console.log(`  [ERROR] ${row.orderId}  ${err.message}`);
      }
    }
    console.log('');
  }
}

const args = process.argv.slice(2);
const fix = args.includes('--fix');
const baseUrlIdx = args.indexOf('--base-url');
const baseUrl = baseUrlIdx >= 0 && args[baseUrlIdx + 1] ? args[baseUrlIdx + 1] : undefined;

crossCheck({ fix, baseUrl })
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
