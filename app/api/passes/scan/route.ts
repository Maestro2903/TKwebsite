import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/adminApp';
import { verifySignedQR } from '@/features/passes/qrService';
import { decryptQRData } from '@/lib/crypto/qrEncryption';
import { checkRateLimit } from '@/lib/security/rateLimiter';

/**
 * POST /api/passes/scan
 * Verifies a pass and marks it as used.
 * Restricted to Organizers.
 * Accepts two QR formats:
 * 1. Signed token: JSON { token: "passId:exp.signature" } or raw token string (webhook-created passes)
 * 2. Encrypted payload: "IV:hexData" (payment verify-created passes)
 */
export async function POST(req: NextRequest) {
    // Rate limit to prevent brute-forcing signatures
    const rateLimitResponse = await checkRateLimit(req, { limit: 10, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const authHeader = req.headers.get('Authorization');
        const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!idToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let decoded: { uid: string };
        try {
            decoded = await getAdminAuth().verifyIdToken(idToken);
        } catch {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        let body: { qrData?: string };
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }
        const qrData = typeof body?.qrData === 'string' ? body.qrData : '';
        if (!qrData) {
            return NextResponse.json({ error: 'Missing QR data' }, { status: 400 });
        }

        const db = getAdminFirestore();

        // 1. Verify Requesting User is an Organizer
        const userDoc = await db.collection('users').doc(decoded.uid).get();
        if (!userDoc.data()?.isOrganizer) {
            return NextResponse.json({ error: 'Forbidden: Organizer access required' }, { status: 403 });
        }

        // 2. Resolve passId: try signed token first, then encrypted payload
        let passId: string | null = null;

        // 2a. Try signed token format (JSON with .token or raw "passId:exp.signature")
        let token: string;
        try {
            const parsed = JSON.parse(qrData);
            token = parsed.token ?? qrData;
        } catch {
            token = qrData;
        }
        const verification = verifySignedQR(token);
        if (verification.valid && verification.passId) {
            passId = verification.passId;
        }

        // 2b. If not valid signed token, try encrypted format (IV:hex from payment/verify)
        if (!passId) {
            try {
                const decrypted = decryptQRData(qrData);
                if (decrypted && typeof decrypted === 'object' && decrypted.id) {
                    passId = decrypted.id;
                }
            } catch {
                // Not valid encrypted data
            }
        }

        if (!passId) {
            return NextResponse.json({ error: 'Invalid QR code' }, { status: 400 });
        }

        // 3. Update Firestore
        const passRef = db.collection('passes').doc(passId);
        const passDoc = await passRef.get();

        if (!passDoc.exists) {
            return NextResponse.json({ error: 'Pass registration not found' }, { status: 404 });
        }

        const passData = passDoc.data();
        if (passData?.usedAt) {
            return NextResponse.json({
                error: 'Pass already used',
                usedAt: passData.usedAt.toDate?.() ?? passData.usedAt
            }, { status: 409 });
        }

        await passRef.update({
            status: 'used',
            usedAt: new Date(),
            scannedBy: decoded.uid,
        });

        return NextResponse.json({
            success: true,
            message: 'Pass verified successfully',
            pass: {
                id: passDoc.id,
                passType: passData?.passType,
                userId: passData?.userId,
            }
        });

    } catch (error) {
        console.error('Scan pass error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
