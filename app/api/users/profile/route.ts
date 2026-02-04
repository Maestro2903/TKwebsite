import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { validateProfileInput, sanitizeInput } from '@/lib/validation';
import { sendEmail, emailTemplates } from '@/backend/lib/email';
import { checkRateLimit } from '@/backend/lib/rate-limit';

/**
 * GET /api/users/profile
 * Fetches the logged-in user's profile from Firestore.
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
        const userDoc = await db.collection('users').doc(decoded.uid).get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const userData = userDoc.data();
        return NextResponse.json({
            uid: decoded.uid,
            email: userData?.email || null,
            name: userData?.name || null,
            college: userData?.college || null,
            phone: userData?.phone || null,
            isOrganizer: userData?.isOrganizer || false,
            createdAt: userData?.createdAt?.toDate?.() || null,
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

/**
 * POST /api/users/profile
 * Creates or updates the user's profile in Firestore.
 */
export async function POST(req: NextRequest) {
    const rateLimitResponse = await checkRateLimit(req, { limit: 5, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const authHeader = req.headers.get('Authorization');
        const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!idToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let decoded: { uid: string; email?: string };
        try {
            decoded = await getAdminAuth().verifyIdToken(idToken);
        } catch {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await req.json();
        const { name, college, phone } = body;

        // Validate inputs
        const validation = validateProfileInput({ name, college, phone });
        if (!validation.valid) {
            return NextResponse.json({ error: 'Validation failed', details: validation.errors }, { status: 400 });
        }

        const db = getAdminFirestore();
        const userRef = db.collection('users').doc(decoded.uid);
        const userDoc = await userRef.get();

        const profileData = {
            name: sanitizeInput(name),
            college: sanitizeInput(college),
            phone: phone.trim(),
            email: decoded.email || null,
            updatedAt: new Date(),
        };

        if (userDoc.exists) {
            // Update existing profile
            await userRef.update(profileData);
        } else {
            // Create new profile
            await userRef.set({
                ...profileData,
                uid: decoded.uid,
                isOrganizer: false,
                createdAt: new Date(),
            });

            // Send Welcome Email
            if (profileData.email) {
                const welcomeTemplate = emailTemplates.welcome(profileData.name);
                await sendEmail({
                    to: profileData.email,
                    subject: welcomeTemplate.subject,
                    html: welcomeTemplate.html,
                }).catch(err => console.error('Welcome email failed:', err));
            }
        }

        return NextResponse.json({ success: true, message: 'Profile saved' });
    } catch (error) {
        console.error('Save profile error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
