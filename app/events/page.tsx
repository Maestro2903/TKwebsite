'use client';

import { useState, useEffect, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import EventCategorySwitch from '@/components/EventCategorySwitch';
import EventsGrid from '@/components/EventsGrid';
import StickyRegisterCTA from '@/components/StickyRegisterCTA';
import { useLenis } from '@/hooks/useLenis';
import type { EventItem } from '@/lib/eventsData';

export default function EventsPage() {
  useLenis();

  const [category, setCategory] = useState<'non-technical' | 'technical'>('non-technical');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Code-split eventsData - only load on events page
  useEffect(() => {
    import('@/lib/eventsData').then((module) => {
      const eventsData = category === 'non-technical' ? module.NON_TECHNICAL_EVENTS : module.TECHNICAL_EVENTS;
      setEvents(eventsData);
      setIsLoading(false);
    });
  }, [category]);

  // Memoize events array to prevent unnecessary re-renders
  const memoizedEvents = useMemo(() => events, [events]);

  return (
    <>
      <Navigation />

      <main id="main" className="page_main page_main--events">
        <EventCategorySwitch value={category} onChange={setCategory} />

        <div
          data-wf--spacer--section-space="main"
          className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
        />

        {isLoading ? (
          <div className="events-loading">
            <div className="events-loading__spinner">
              <div className="events-spinner" aria-label="Loading events" />
            </div>
          </div>
        ) : (
          <EventsGrid key={category} events={memoizedEvents} category={category} />
        )}

        <div
          data-wf--spacer--section-space="main"
          className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
        />
      </main>

      <Footer />

      <StickyRegisterCTA />
    </>
  );
}
