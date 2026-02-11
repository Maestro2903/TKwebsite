/**
 * QR Code signing utilities.
 * Signs QR data with HMAC to prevent forgery.
 */

import crypto from 'crypto';

const QR_SECRET = process.env.QR_SECRET_KEY;

if (!QR_SECRET) {
    throw new Error('FATAL: QR_SECRET_KEY environment variable is not set. QR generation is disabled.');
}

/**
 * Creates a signed QR payload.
 * Format: passId:expiry.signature
 */
export function createSignedQR(passId: string, expiryDays: number = 30): string {
    const expiry = Date.now() + expiryDays * 24 * 60 * 60 * 1000;
    const payload = `${passId}:${expiry}`;

    const signature = crypto
        .createHmac('sha256', QR_SECRET)
        .update(payload)
        .digest('hex')
        .substring(0, 16); // Shorter signature for QR

    return `${payload}.${signature}`;
}

/**
 * Verifies a signed QR payload.
 * Returns passId if valid, null if invalid or expired.
 */
export function verifySignedQR(qrData: string): {
    valid: boolean;
    passId?: string;
    error?: string;
} {
    if (!qrData || typeof qrData !== 'string') {
        return { valid: false, error: 'Invalid QR data' };
    }

    const parts = qrData.split('.');
    if (parts.length !== 2) {
        return { valid: false, error: 'Invalid QR format' };
    }

    const [payload, signature] = parts;
    const payloadParts = payload.split(':');

    if (payloadParts.length !== 2) {
        return { valid: false, error: 'Invalid payload format' };
    }

    const [passId, expiryStr] = payloadParts;
    const expiry = parseInt(expiryStr, 10);

    // Check expiry
    if (isNaN(expiry) || Date.now() > expiry) {
        return { valid: false, error: 'QR code expired' };
    }

    // Verify signature
    const expectedSignature = crypto
        .createHmac('sha256', QR_SECRET)
        .update(payload)
        .digest('hex')
        .substring(0, 16);

    if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true, passId };
}

/**
 * Creates QR payload for JSON encoding (used in QR image).
 * Includes signed token for verification.
 */
export function createQRPayload(passId: string, userId: string, passType: string): string {
    const signedToken = createSignedQR(passId);

    return JSON.stringify({
        passId,
        userId,
        passType,
        token: signedToken,
    });
}
