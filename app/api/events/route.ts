import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/adminApp';
import type { Event } from '@/lib/db/firestoreTypes';

/**
 * GET /api/events
 * 
 * Query parameters:
 * - date: Filter by event date (ISO format: "2026-02-26")
 * - type: Filter by event type ("individual" | "group" | "workshop")
 * - category: Filter by category ("technical" | "non_technical")
 * - passType: Filter by allowed pass types
 * 
 * Returns all active events matching the criteria
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const passType = searchParams.get('passType');

    const db = getAdminFirestore();
    let query = db.collection('events').where('isActive', '==', true);

    // Apply filters
    if (date) {
      query = query.where('date', '==', date);
    }
    if (type) {
      query = query.where('type', '==', type);
    }
    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    
    let events = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to ISO strings for JSON serialization
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as Event;
    });

    // Filter by allowedPassTypes if provided (array_contains not available in all Firestore SDKs)
    if (passType) {
      events = events.filter(event => 
        event.allowedPassTypes && event.allowedPassTypes.includes(passType as any)
      );
    }

    // Sort by date and name for consistent ordering
    events.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ 
      success: true, 
      events,
      count: events.length 
    });
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
