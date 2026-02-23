import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/adminApp';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * POST /api/mock-summit/assign-country
 * Auth required. Body: { countryId: string }
 * Uses Firestore transaction: assign country to uid if not already assigned.
 * Returns 409 if country already assigned; 400 if invalid; 401 if unauthorized.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await getAdminAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await req.json();
    const countryId = typeof body.countryId === 'string' ? body.countryId.trim() : '';
    if (!countryId) {
      return NextResponse.json({ error: 'countryId is required' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const countryRef = db.collection('mockSummitCountries').doc(countryId);

    // Check if user already has an assigned country (block reassignment)
    const existingAssignment = await db
      .collection('mockSummitCountries')
      .where('assignedTo', '==', uid)
      .limit(1)
      .get();

    if (!existingAssignment.empty && existingAssignment.docs[0].id !== countryId) {
      const existing = existingAssignment.docs[0].data();
      return NextResponse.json(
        { error: 'You have already selected a country. Reassignment is not allowed.' },
        { status: 409 }
      );
    }

    if (!existingAssignment.empty && existingAssignment.docs[0].id === countryId) {
      // Already assigned this country to self — idempotent success
      const doc = await countryRef.get();
      const data = doc.data();
      return NextResponse.json({
        success: true,
        countryId: doc.id,
        countryName: data?.name ?? doc.id,
      });
    }

    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(countryRef);
      if (!doc.exists) {
        throw { status: 400, message: 'Invalid country' };
      }
      const data = doc.data();
      if (data?.assignedTo != null && data.assignedTo !== uid) {
        throw { status: 409, message: 'Country already assigned' };
      }
      transaction.update(countryRef, {
        assignedTo: uid,
        assignedAt: FieldValue.serverTimestamp(),
      });
      return { name: data?.name ?? doc.id };
    });

    return NextResponse.json({
      success: true,
      countryId,
      countryName: result.name,
    });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e?.status === 409) {
      return NextResponse.json({ error: e.message ?? 'Country already assigned' }, { status: 409 });
    }
    if (e?.status === 400) {
      return NextResponse.json({ error: e.message ?? 'Bad request' }, { status: 400 });
    }
    console.error('[mock-summit/assign-country]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
