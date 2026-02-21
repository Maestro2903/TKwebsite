import { NextRequest, NextResponse } from 'next/server';
import { getCachedEvents } from '@/lib/cache/eventsCache';

/**
 * GET /api/events
 * 
 * Query parameters:
 * - date: Filter by event date (ISO format: "2026-02-26")
 * - type: Filter by event type ("individual" | "group" | "workshop")
 * - category: Filter by category ("technical" | "non_technical")
 * - passType: Filter by allowed pass types
 * 
 * Returns all active events matching the criteria.
 * Uses server-side in-memory cache (5-min TTL) to minimise Firestore reads.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || undefined;
    const type = searchParams.get('type') || undefined;
    const category = searchParams.get('category') || undefined;
    const passType = searchParams.get('passType') || undefined;

    const events = await getCachedEvents({ date, type, category, passType });

    return NextResponse.json(
      { success: true, events, count: events.length },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        },
      }
    );
  } catch (error: unknown) {
    console.error('Events API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch events'
      },
      { status: 500 }
    );
  }
}
