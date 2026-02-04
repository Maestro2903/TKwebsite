import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

/**
 * GET /api/passes/[passId]
 * Fetches details for a specific pass.
 * Accessible by owner or organizer.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { passId: string } }
) {
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

        const { passId } = params;
        const db = getAdminFirestore();
        const passDoc = await db.collection('passes').doc(passId).get();

        if (!passDoc.exists) {
            return NextResponse.json({ error: 'Pass not found' }, { status: 404 });
        }

        const passData = passDoc.data();

        // Check if requester is owner OR organizer
        if (passData?.userId !== decoded.uid) {
            const userDoc = await db.collection('users').doc(decoded.uid).get();
            if (!userDoc.data()?.isOrganizer) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        return NextResponse.json({
            id: passDoc.id,
            ...passData,
            createdAt: passData?.createdAt?.toDate?.() || null,
            usedAt: passData?.usedAt?.toDate?.() || null,
        });
    } catch (error) {
        console.error('Get pass details error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
