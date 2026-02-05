import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
    limit: number;
    windowMs: number;
}

/**
 * A simple memory-based rate limiter.
 * Note: In a serverless environment like Vercel, this is per-instance.
 * For production with multiple instances, consider using Upstash Redis.
 */
export async function rateLimit(
    req: NextRequest,
    { limit, windowMs }: RateLimitOptions = { limit: 10, windowMs: 60000 }
) {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();

    if (!store[ip] || now > store[ip].resetTime) {
        store[ip] = {
            count: 1,
            resetTime: now + windowMs,
        };
        return { success: true, remaining: limit - 1 };
    }

    store[ip].count++;

    if (store[ip].count > limit) {
        return { success: false, remaining: 0 };
    }

    return { success: true, remaining: limit - store[ip].count };
}

/**
 * Middleware-like helper for use inside route handlers.
 */
export async function checkRateLimit(
    req: NextRequest,
    options?: RateLimitOptions
) {
    const result = await rateLimit(req, options);

    if (!result.success) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: {
                    'Retry-After': Math.ceil(options?.windowMs || 60000 / 1000).toString(),
                }
            }
        );
    }

    return null;
}
