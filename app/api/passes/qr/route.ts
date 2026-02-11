import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/adminApp';
import { createQRPayload } from '@/features/passes/qrService';

/**
 * GET /api/passes/qr?passId=xxx
 * Dynamically generates a QR code for a given pass
 * Requires authentication: Bearer token
 * Authorization: Pass owner OR organizer only
 */
export async function GET(req: NextRequest) {
    try {
        // Authentication check
        const authHeader = req.headers.get('Authorization');
        const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
        
        if (!idToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let decoded: { uid: string };
        try {
            decoded = await getAdminAuth().verifyIdToken(idToken);
        } catch (tokenError: unknown) {
            const err = tokenError as { code?: string };
            console.error('Token verification failed:', tokenError);
            const isExpired = err?.code === 'auth/id-token-expired';
            return NextResponse.json(
                { error: isExpired ? 'Session expired. Please sign in again.' : 'Invalid token' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const passId = searchParams.get('passId');

        if (!passId) {
            return NextResponse.json({ error: 'Missing passId' }, { status: 400 });
        }

        const db = getAdminFirestore();
        const passDoc = await db.collection('passes').doc(passId).get();

        if (!passDoc.exists) {
            return NextResponse.json({ error: 'Pass not found' }, { status: 404 });
        }

        const passData = passDoc.data();

        // Authorization check: pass owner OR organizer
        let isAuthorized = false;

        // Check if user is pass owner
        if (passData?.userId === decoded.uid) {
            isAuthorized = true;
        } else {
            // Check if user is organizer
            const userDoc = await db.collection('users').doc(decoded.uid).get();
            if (userDoc.exists && userDoc.data()?.isOrganizer === true) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return NextResponse.json(
                { error: 'Forbidden: You do not have access to this pass' },
                { status: 403 }
            );
        }

        // Generate QR code dynamically
        const qrData = createQRPayload(
            passId,
            passData?.userId as string,
            passData?.passType as string
        );

        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
            width: 500,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        return NextResponse.json({
            success: true,
            passId,
            qrCode: qrCodeDataUrl,
            passType: passData?.passType,
            userId: passData?.userId,
            status: passData?.status,
        });
    } catch (error: unknown) {
        console.error('Generate QR error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Server error' },
            { status: 500 }
        );
    }
}
