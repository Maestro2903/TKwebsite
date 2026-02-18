import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/adminApp';

const REFERRAL_PREFIX = 'TKX';

function generateReferralCode(uid: string): string {
  const first4 = uid.substring(0, 4);
  const random3 = Math.floor(100 + Math.random() * 900).toString();
  return `${REFERRAL_PREFIX}${first4}${random3}`;
}

/**
 * GET /api/users/referral-code
 * Returns the authenticated user's referral code. Generates one if missing.
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
    const userRef = db.collection('users').doc(decoded.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Profile not found. Complete your profile first.' }, { status: 404 });
    }

    const userData = userDoc.data();
    let referralCode = userData?.referralCode;

    if (!referralCode) {
      referralCode = generateReferralCode(decoded.uid);
      await userRef.update({
        referralCode,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ referralCode });
  } catch (error) {
    console.error('Referral code error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
