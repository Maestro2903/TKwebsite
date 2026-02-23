import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/adminApp';

/**
 * GET /api/mock-summit/countries
 * Returns list of countries with id, name, assignedTo (no code/assignedAt in response).
 */
export async function GET() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('mockSummitCountries').get();

    const list = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name ?? doc.id,
        assignedTo: data.assignedTo ?? null,
      };
    });

    list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return NextResponse.json(list);
  } catch (error) {
    console.error('[mock-summit/countries]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
