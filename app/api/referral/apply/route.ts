import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/adminApp';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit } from '@/lib/security/rateLimiter';

/**
 * POST /api/referral/apply
 * Applies a referral code for the current user when they complete their profile.
 * Updates the referrer's invitedUsers, inviteCount, and dayPassUnlocked if applicable.
 */
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const referralCode = typeof body.referralCode === 'string' ? body.referralCode.trim() : null;

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    const db = getAdminFirestore();

    // 1. Verify current user's profile is complete
    const currentUserDoc = await db.collection('users').doc(decoded.uid).get();
    if (!currentUserDoc.exists) {
      return NextResponse.json({ error: 'Profile not found. Complete your profile first.' }, { status: 400 });
    }

    const currentUserData = currentUserDoc.data();
    const name = (currentUserData?.name ?? '').trim();
    const college = (currentUserData?.college ?? '').trim();
    const phone = (currentUserData?.phone ?? '').trim();

    if (!name || !college || !phone) {
      return NextResponse.json({ error: 'Profile must be complete (name, college, phone) before applying referral' }, { status: 400 });
    }

    // 2. Find referrer by referralCode
    const referrerSnapshot = await db.collection('users').where('referralCode', '==', referralCode).limit(1).get();

    if (referrerSnapshot.empty) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
    }

    const referrerDoc = referrerSnapshot.docs[0];
    const referrerId = referrerDoc.id;

    // 3. Prevent self-referral
    if (referrerId === decoded.uid) {
      return NextResponse.json({ error: 'You cannot use your own referral code' }, { status: 400 });
    }

    const referrerData = referrerDoc.data();
    const invitedUsers: string[] = referrerData?.invitedUsers ?? [];
    const inviteCount: number = referrerData?.inviteCount ?? 0;

    // 4. Prevent duplicate counting
    if (invitedUsers.includes(decoded.uid)) {
      return NextResponse.json({ success: true, message: 'Referral already applied' });
    }

    // 5. Transaction: add to invitedUsers, increment inviteCount, set dayPassUnlocked if >= 5
    await db.runTransaction(async (transaction) => {
      const ref = referrerDoc.ref;
      const newInvitedUsers = [...invitedUsers, decoded.uid];
      const newInviteCount = inviteCount + 1;

      const updateData: Record<string, unknown> = {
        invitedUsers: newInvitedUsers,
        inviteCount: newInviteCount,
        updatedAt: new Date(),
      };

      if (newInviteCount >= 5) {
        updateData.dayPassUnlocked = true;
        updateData.inviteUnlockedAt = FieldValue.serverTimestamp();
      }

      transaction.update(ref, updateData);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Referral apply error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
