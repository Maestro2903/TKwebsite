import { NextRequest, NextResponse } from 'next/server';
import { invalidateEventsCache } from '@/lib/cache/eventsCache';

/**
 * GET /api/events/invalidate
 * 
 * Forces the server-side events cache to be cleared.
 * This is useful after seeding new data to ensure the API
 * returns the most up-to-date information immediately.
 */
export async function GET(req: NextRequest) {
    try {
        invalidateEventsCache();
        return NextResponse.json({
            success: true,
            message: 'Events cache invalidated successfully. Next fetch will hit Firestore.',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Invalidation error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to invalidate cache'
        }, { status: 500 });
    }
}
