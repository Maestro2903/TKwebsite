import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/adminApp';
import { verifySignedQR } from '@/features/passes/qrService';
import { checkRateLimit } from '@/lib/security/rateLimiter';

/**
 * POST /api/passes/scan
 * Verifies a pass and marks it as used.
 * Restricted to Organizers.
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

        const { qrData } = await req.json();
        if (!qrData) {
            return NextResponse.json({ error: 'Missing QR data' }, { status: 400 });
        }

        const db = getAdminFirestore();

        // 1. Verify Requesting User is an Organizer
        const userDoc = await db.collection('users').doc(decoded.uid).get();
        if (!userDoc.data()?.isOrganizer) {
            return NextResponse.json({ error: 'Forbidden: Organizer access required' }, { status: 403 });
        }

        // 2. Extract Token (qrData is a JSON string containing the signed token)
        let token: string;
        try {
            const parsed = JSON.parse(qrData);
            token = parsed.token;
        } catch {
            token = qrData; // Fallback if direct token is passed
        }

        // 3. Verify Signature & Expiry
        const verification = verifySignedQR(token);
        if (!verification.valid) {
            return NextResponse.json({ error: verification.error || 'Invalid QR code' }, { status: 400 });
        }

        // 4. Update Firestore
        const passRef = db.collection('passes').doc(verification.passId!);
        const passDoc = await passRef.get();

        if (!passDoc.exists) {
            return NextResponse.json({ error: 'Pass registration not found' }, { status: 404 });
        }

        const passData = passDoc.data();
        if (passData?.usedAt) {
            return NextResponse.json({
                error: 'Pass already used',
                usedAt: passData.usedAt.toDate()
            }, { status: 409 });
        }

        await passRef.update({
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
