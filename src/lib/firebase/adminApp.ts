import * as admin from 'firebase-admin';

/**
 * Normalize private key from env (handles \n escape, line endings, single-line PEM).
 * OpenSSL DECODER error often comes from malformed or incorrectly escaped keys.
 */
function normalizePrivateKey(raw: string): string {
  let key = raw.trim();
  if (!key) return key;
  // Unescape literal \n (e.g. from Vercel/env where key is stored as "-----BEGIN...\nMII...")
  key = key.replace(/\\n/g, '\n');
  key = key.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  key = key.trim();
  // If key is one long line (no newlines), try to restore PEM shape so OpenSSL can decode
  if (!key.includes('\n') && key.includes('-----BEGIN') && key.includes('-----END')) {
    const begin = '-----BEGIN PRIVATE KEY-----';
    const end = '-----END PRIVATE KEY-----';
    const start = key.indexOf(begin);
    const endStart = key.indexOf(end);
    if (start !== -1 && endStart > start) {
      const middle = key.slice(start + begin.length, endStart).replace(/\s/g, '');
      const lines = middle.match(/.{1,64}/g) || [];
      key = begin + '\n' + lines.join('\n') + '\n' + end;
    }
  }
  return key;
}

function getAdminApp() {
  if (admin.apps.length > 0) return admin.app();

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  let credential;

  if (serviceAccountKey) {
    credential = admin.credential.cert(JSON.parse(serviceAccountKey) as admin.ServiceAccount);
  } else if (clientEmail && privateKey) {
    const normalizedKey = normalizePrivateKey(privateKey);
    credential = admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: clientEmail.trim(),
      privateKey: normalizedKey,
    });
  } else {
    throw new Error(
      'Firebase Admin credentials missing. Provide either FIREBASE_SERVICE_ACCOUNT_KEY or both FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY.'
    );
  }

  return admin.initializeApp({
    credential,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || undefined,
  });
}

export function getAdminAuth() {
  return getAdminApp().auth();
}

export function getAdminFirestore() {
  return getAdminApp().firestore();
}
