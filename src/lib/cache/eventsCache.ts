import { getAdminFirestore } from '@/lib/firebase/adminApp';

/**
 * Server-side in-memory events cache.
 *
 * All active events are fetched once from Firestore then served from memory
 * for up to CACHE_TTL_MS.  Every subsequent request reads the cached array
 * instead of hitting Firestore, saving thousands of reads per day.
 *
 * NOTE: On Vercel serverless each lambda instance holds its own cache.
 * This is still a huge win because a single instance typically serves many
 * requests before being recycled.
 */

// ── Types ────────────────────────────────────────────────────────────────

export interface CachedEvent {
    id: string;
    name: string;
    category: string;
    type: string;
    date: string;
    venue: string;
    prizePool?: number;
    minMembers?: number;
    maxMembers?: number;
    allowedPassTypes: string[];
    isActive: boolean;
    description?: string;
    image?: string;
    startTime?: string;
    endTime?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown; // allow extra Firestore fields
}

interface EventsFilterOptions {
    date?: string;
    type?: string;
    category?: string;
    passType?: string;
}

// ── Cache state ──────────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cachedEvents: CachedEvent[] = [];
let cacheTimestamp = 0;
let cachePromise: Promise<CachedEvent[]> | null = null;

// ── Internal helpers ────────────────────────────────────────────────────

async function fetchEventsFromFirestore(): Promise<CachedEvent[]> {
    const db = getAdminFirestore();
    const snapshot = await db
        .collection('events')
        .where('isActive', '==', true)
        .get();

    const events = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Normalise Timestamps → ISO strings for safe serialisation
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as CachedEvent;
    });

    // Consistent sort by date then name
    events.sort((a, b) => {
        const d = a.date.localeCompare(b.date);
        return d !== 0 ? d : a.name.localeCompare(b.name);
    });

    return events;
}

/**
 * Returns the cached events, refreshing from Firestore if the cache has
 * expired.  Concurrent calls during a refresh share the same promise so
 * only ONE Firestore read is made.
 */
async function ensureCache(): Promise<CachedEvent[]> {
    const now = Date.now();

    if (cachedEvents.length > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
        return cachedEvents;
    }

    // Deduplicate concurrent refresh requests
    if (!cachePromise) {
        cachePromise = fetchEventsFromFirestore()
            .then((events) => {
                cachedEvents = events;
                cacheTimestamp = Date.now();
                cachePromise = null;
                console.log(
                    `[EventsCache] Refreshed — ${events.length} events cached at ${new Date().toISOString()}`
                );
                return events;
            })
            .catch((err) => {
                cachePromise = null;
                console.error('[EventsCache] Refresh failed:', err);
                // Return stale data if available, otherwise rethrow
                if (cachedEvents.length > 0) {
                    console.warn('[EventsCache] Serving stale cache after error');
                    return cachedEvents;
                }
                throw err;
            });
    }

    return cachePromise;
}

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Get all active events, optionally filtered.
 * Reads from cache (0 Firestore reads in most cases).
 */
export async function getCachedEvents(
    filters?: EventsFilterOptions
): Promise<CachedEvent[]> {
    let events = await ensureCache();

    if (filters?.date) {
        events = events.filter((e) => e.date === filters.date);
    }
    if (filters?.type) {
        events = events.filter((e) => e.type === filters.type);
    }
    if (filters?.category) {
        events = events.filter((e) => e.category === filters.category);
    }
    if (filters?.passType) {
        events = events.filter(
            (e) => e.allowedPassTypes && e.allowedPassTypes.includes(filters.passType!)
        );
    }

    return events;
}

/**
 * Get a single event by ID from cache.
 * Returns undefined if not found or inactive.
 */
export async function getCachedEventById(
    id: string
): Promise<CachedEvent | undefined> {
    const events = await ensureCache();
    return events.find((e) => e.id === id);
}

/**
 * Get multiple events by their IDs from cache.
 * Returns only events that exist and are active.
 */
export async function getCachedEventsByIds(
    ids: string[]
): Promise<CachedEvent[]> {
    const events = await ensureCache();
    const idSet = new Set(ids);
    return events.filter((e) => idSet.has(e.id));
}

/**
 * Force-clear the cache.  Next call to any cache function
 * will trigger a fresh Firestore read.
 */
export function invalidateEventsCache(): void {
    cachedEvents = [];
    cacheTimestamp = 0;
    cachePromise = null;
    console.log('[EventsCache] Cache invalidated');
}
