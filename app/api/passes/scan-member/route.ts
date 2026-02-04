import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { checkRateLimit } from '@/backend/lib/rate-limit';
import * as admin from 'firebase-admin';

/**
 * POST /api/passes/scan-member
 * Marks an individual team member as checked in.
 * Restricted to Organizers only.
 */
export async function POST(req: NextRequest) {
    const rateLimitResponse = await checkRateLimit(req, { limit: 20, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    try {
        // 1. Authenticate Organizer
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
        const userDoc = await db.collection('users').doc(decoded.uid).get();
        if (!userDoc.data()?.isOrganizer) {
            return NextResponse.json({ error: 'Forbidden: Organizer access required' }, { status: 403 });
        }

        // 2. Parse Request Body
        const body = await req.json();
        const { teamId, memberId } = body;

        if (!teamId || !memberId) {
            return NextResponse.json({ error: 'Missing teamId or memberId' }, { status: 400 });
        }

        // 3. Fetch Team Document
        const teamRef = db.collection('teams').doc(teamId);
        const teamDoc = await teamRef.get();

        if (!teamDoc.exists) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        const teamData = teamDoc.data();
        const members = teamData?.members || [];

        // 4. Find the member to update
        const memberIndex = members.findIndex((m: any) => m.memberId === memberId);
        if (memberIndex === -1) {
            return NextResponse.json({ error: 'Member not found in team' }, { status: 404 });
        }

        const member = members[memberIndex];

        // Check if already checked in
        if (member.attendance?.checkedIn) {
            return NextResponse.json({
                error: 'Member already checked in',
                checkedInAt: member.attendance.checkInTime,
            }, { status: 409 });
        }

        // 5. Update member attendance (atomic array update)
        const updatedMember = {
            ...member,
            attendance: {
                checkedIn: true,
                checkInTime: admin.firestore.FieldValue.serverTimestamp(),
                checkedInBy: decoded.uid,
            },
        };

        // Remove old member and add updated one
        await teamRef.update({
            members: admin.firestore.FieldValue.arrayRemove(member),
        });

        await teamRef.update({
            members: admin.firestore.FieldValue.arrayUnion(updatedMember),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            message: 'Member checked in successfully',
            member: {
                memberId: updatedMember.memberId,
                name: updatedMember.name,
                checkedIn: true,
            },
        });

    } catch (error) {
        console.error('Scan member error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
