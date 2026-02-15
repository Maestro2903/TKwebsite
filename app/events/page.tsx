'use client';

import { useState, useEffect } from 'react';
import Footer from '@/components/layout/Footer';
import { EventsHero } from '@/components/sections/events/EventsHero';
import EventCategorySwitch from '@/components/sections/events/EventCategorySwitch';
import EventsGrid from '@/components/sections/events/EventsGrid';
import type { EventItem } from '@/data/events';

export default function EventsPage() {
  const [category, setCategory] = useState<'non-technical' | 'technical'>('non-technical');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Code-split eventsData - only load on events page
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    import('@/data/events')
      .then((module) => {
        const eventsData = category === 'non-technical' ? module.NON_TECHNICAL_EVENTS : module.TECHNICAL_EVENTS;
        setEvents(eventsData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load events data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load events'));
        setIsLoading(false);
        setEvents([]);
      });
  }, [category]);

  return (
    <>
      <main id="main" className="page_main page_main--events page_main--events-editorial relative z-10 bg-[var(--editorial-black,#000)]">
        <EventsHero />

        <section className="events-filter-section">
          <EventCategorySwitch value={category} onChange={setCategory} />
        </section>

        <div className="events-content-shell mt-5">
          {isLoading ? (
            <div className="events-loading">
              <div className="events-loading__spinner">
                <div className="events-spinner" aria-label="Loading events" />
              </div>
            </div>
          ) : error ? (
            <div className="events-error" role="alert">
              <p className="text-[var(--editorial-gray-muted,#999)] text-center p-8">
                Failed to load events. Please try refreshing the page.
              </p>
            </div>
          ) : (
            <EventsGrid key={category} events={events} category={category} />
          )}
        </div>

        <div
          data-wf--spacer--section-space="main"
          className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
        />
      </main>

      <Footer />
    </>
  );
}
