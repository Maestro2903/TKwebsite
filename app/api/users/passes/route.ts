import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/adminApp';

/**
 * GET /api/users/passes
 * Fetches all passes for the logged-in user.
 */
export async function GET(req: NextRequest) {
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

        const db = getAdminFirestore();

        // Fetch passes for this user
        const passesSnapshot = await db
            .collection('passes')
            .where('userId', '==', decoded.uid)
            .orderBy('createdAt', 'desc')
            .get();

        const passes = passesSnapshot.docs.map((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate?.() || null;
            const usedAt = data.usedAt?.toDate?.() || null;

            return {
                id: doc.id,
                passType: data.passType,
                amount: data.amount,
                status: data.status,
                qrCode: data.qrCode,
                paymentId: data.paymentId,
                createdAt,
                usedAt,
                selectedEvents: data.selectedEvents || [],
                selectedDays: data.selectedDays || [],
                eventAccess: data.eventAccess || null,
                teamSnapshot: data.teamSnapshot || null,
            };
        });

        return NextResponse.json({ passes });
    } catch (error) {
        console.error('Get passes error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
