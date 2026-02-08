import { NextResponse } from 'next/server';
import { PASS_TYPES } from '@/types/passes';

/**
 * GET /api/passes/types
 * Returns the canonical pass types and prices.
 * This allows the frontend to fetch pricing information dynamically.
 */
export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            passTypes: PASS_TYPES,
        });
    } catch (error: unknown) {
        console.error('Error fetching pass types:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pass types' },
            { status: 500 }
        );
    }
}
