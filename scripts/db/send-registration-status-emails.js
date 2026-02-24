/**
 * One-off script to send registration status emails via Gmail SMTP
 * for existing registrations in Firestore.
 *
 * Usage:
 *   node scripts/db/send-registration-status-emails.js
 *
 * Requires:
 *   - FIREBASE_ADMIN_* env (same as other db scripts)
 *   - SMTP_USER and SMTP_PASS in your local env (.env.local or .env)
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

function loadEnv() {
  const candidates = ['.env.local', '.env'];
  for (const filename of candidates) {
    const envPath = path.resolve(process.cwd(), filename);
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
      break;
    }
  }
}

loadEnv();

if (!admin.apps.length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      }),
    });
  }
}

const db = admin.firestore();

const ALLOWED_STATUSES = ['pending'];

function buildEmail(status, name) {
  const safeName = (name || 'there').trim();

  switch (status) {
    case 'pending':
      return {
        subject: 'We got your registration 👀✨',
        html: `
<div style="font-family: Inter, Arial, sans-serif; background:#0f0f0f; color:#ffffff; padding:40px 20px; text-align:center;">
  <h1 style="font-size:28px; margin-bottom:10px;">You're in (almost) 👀</h1>

  <p style="font-size:16px; opacity:0.85; max-width:480px; margin:0 auto 20px;">
    Hey ${safeName}, we’ve received your registration for <strong>Takshashila 2026</strong>.
  </p>

  <p style="font-size:16px; opacity:0.85; max-width:480px; margin:0 auto 30px;">
    Your status is currently <strong>Pending</strong> — no stress, just vibes.
  </p>

  <div style="background:#1a1a1a; padding:20px; border-radius:12px; max-width:420px; margin:0 auto;">
    <p style="margin:0; font-size:14px; opacity:0.8;">
      You’ll hear from us soon.<br/>
      Until then, start planning your main character moment.
    </p>
  </div>

  <p style="margin-top:30px; font-size:12px; opacity:0.6;">
    CIT Takshashila 2026 · Chennai
  </p>
</div>`.trim(),
      };
    case 'converted':
      return {
        subject: 'You’re officially part of Takshashila 😤🔥',
        html: `
<div style="font-family: Inter, Arial, sans-serif; background:#0f0f0f; color:#ffffff; padding:40px 20px; text-align:center;">
  <h1 style="font-size:28px; margin-bottom:10px;">It’s official 😤🔥</h1>

  <p style="font-size:16px; opacity:0.9; max-width:480px; margin:0 auto 20px;">
    ${safeName}, your registration has been <strong>successfully confirmed</strong>.
  </p>

  <p style="font-size:16px; opacity:0.85; max-width:480px; margin:0 auto 30px;">
    You’re now locked in for <strong>Takshashila 2026</strong>.<br/>
    Get ready for chaos, competition, concerts, and core memories.
  </p>

  <div style="background:linear-gradient(135deg,#ffcc00,#ff7a00); color:#000; padding:20px; border-radius:12px; max-width:420px; margin:0 auto;">
    <p style="margin:0; font-size:15px; font-weight:600;">
      Big W secured.<br/>
      See you on campus.
    </p>
  </div>

  <p style="margin-top:30px; font-size:12px; opacity:0.6;">
    Save this email. Flex responsibly.
  </p>
</div>`.trim(),
      };
    case 'cancelled':
      return {
        subject: 'Update about your registration 💔',
        html: `
<div style="font-family: Inter, Arial, sans-serif; background:#0f0f0f; color:#ffffff; padding:40px 20px; text-align:center;">
  <h1 style="font-size:28px; margin-bottom:10px;">Quick update 💔</h1>

  <p style="font-size:16px; opacity:0.9; max-width:480px; margin:0 auto 20px;">
    Hey ${safeName}, your registration status has been marked as <strong>Cancelled</strong>.
  </p>

  <p style="font-size:16px; opacity:0.85; max-width:480px; margin:0 auto 30px;">
    We know that’s not the email you wanted.<br/>
    If this was unexpected, feel free to reach out and we’ll sort it out.
  </p>

  <div style="background:#1a1a1a; padding:20px; border-radius:12px; max-width:420px; margin:0 auto;">
    <p style="margin:0; font-size:14px; opacity:0.8;">
      Still rooting for you. Always.
    </p>
  </div>

  <p style="margin-top:30px; font-size:12px; opacity:0.6;">
    CIT Takshashila 2026 · Support Team
  </p>
</div>`.trim(),
      };
    default:
      return null;
  }
}

async function main() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.error('❌ Missing SMTP_USER / SMTP_PASS in environment (.env.local or .env)');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  console.log('📡 Fetching registrations with statuses:', ALLOWED_STATUSES.join(', '));

  const snap = await db
    .collection('registrations')
    .where('status', 'in', ALLOWED_STATUSES)
    .get();

  if (snap.empty) {
    console.log('No registrations found with matching statuses.');
    return;
  }

  console.log(`Found ${snap.size} registrations. Processing...`);

  for (const doc of snap.docs) {
    const data = doc.data();
    const registrationId = doc.id;
    const status = data.status;
    const email = (data.email || '').trim();
    const name = data.name || 'there';
    const emailSentForStatus = data.emailSentForStatus;

    if (!email) {
      console.log(`- [SKIP] ${registrationId}: no email`);
      continue;
    }
    if (!ALLOWED_STATUSES.includes(status)) {
      console.log(`- [SKIP] ${registrationId}: unsupported status '${status}'`);
      continue;
    }
    if (emailSentForStatus === status) {
      console.log(`- [SKIP] ${registrationId}: already sent for status '${status}'`);
      continue;
    }

    const emailContent = buildEmail(status, name);
    if (!emailContent) {
      console.log(`- [SKIP] ${registrationId}: could not build email for status '${status}'`);
      continue;
    }

    const logId = `${registrationId}_${status}`;
    const logRef = db.collection('emailLogs').doc(logId);

    console.log(`- [SEND] ${registrationId} -> ${email} (status=${status})`);

    try {
      await logRef.set(
        {
          registrationId,
          userId: data.userId || data.uid || null,
          email,
          statusTriggered: status,
          state: 'processing',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          source: 'backfill-script',
        },
        { merge: true }
      );

      const info = await transporter.sendMail({
        from: `"CIT Takshashila" <${smtpUser}>`,
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      await Promise.all([
        logRef.set(
          {
            state: 'sent',
            smtpMessageId: info.messageId || null,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        ),
        doc.ref.set(
          {
            emailSentForStatus: status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        ),
      ]);

      console.log(`   ✅ Sent (messageId=${info.messageId || 'n/a'})`);
    } catch (err) {
      console.error(`   ❌ Failed to send for ${registrationId}:`, err.message || err);
      await logRef.set(
        {
          state: 'failed',
          error: err.message || String(err),
          failedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
  }

  console.log('🎉 Done processing registrations.');
}

main().catch((err) => {
  console.error('❌ Script crashed:', err);
  process.exit(1);
});

