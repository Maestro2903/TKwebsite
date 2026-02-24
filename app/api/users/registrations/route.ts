import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/adminApp';
import type { Registration } from '@/lib/db/firestoreTypes';

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
    const snap = await db
      .collection('registrations')
      .where('userId', '==', decoded.uid)
      .where('status', '!=', 'converted')
      .orderBy('status')
      .orderBy('createdAt', 'desc')
      .get();

    const registrations = snap.docs.map((doc) => {
      const data = doc.data() as Registration;
      return {
        id: doc.id,
        ...data,
      };
    });

    return NextResponse.json({ registrations });
  } catch (error) {
    console.error('Get registrations error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

