'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import EventCategorySwitch from '@/components/sections/events/EventCategorySwitch';
import EventsGrid from '@/components/sections/events/EventsGrid';
import FabricGridBackground from '@/components/decorative/FabricGridBackground';
import { useLenis } from '@/hooks/useLenis';
import type { EventItem } from '@/data/events';

const SCROLL_THRESHOLD_DESKTOP = 60;
const SCROLL_THRESHOLD_MOBILE = 100; // higher so bar doesn’t hide too easily on touch scroll

function getScrollThreshold() {
  if (typeof window === 'undefined') return SCROLL_THRESHOLD_DESKTOP;
  return window.innerWidth <= 768 ? SCROLL_THRESHOLD_MOBILE : SCROLL_THRESHOLD_DESKTOP;
}

export default function EventsPage() {
  useLenis();

  const [category, setCategory] = useState<'non-technical' | 'technical'>('non-technical');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryBarHidden, setCategoryBarHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Hide events category bar on scroll down, show on scroll up (works with Lenis)
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY ?? document.documentElement.scrollTop;
      const threshold = getScrollThreshold();
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (current > threshold) {
            setCategoryBarHidden(current > lastScrollY.current);
          } else {
            setCategoryBarHidden(false);
          }
          lastScrollY.current = current;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Code-split eventsData - only load on events page
  useEffect(() => {
    import('@/data/events').then((module) => {
      const eventsData = category === 'non-technical' ? module.NON_TECHNICAL_EVENTS : module.TECHNICAL_EVENTS;
      setEvents(eventsData);
      setIsLoading(false);
    });
  }, [category]);

  // Memoize events array to prevent unnecessary re-renders
  const memoizedEvents = useMemo(() => events, [events]);

  return (
    <>
      <FabricGridBackground />
      <Navigation />

      <main id="main" className="page_main page_main--events relative z-10">
        <EventCategorySwitch value={category} onChange={setCategory} isHidden={categoryBarHidden} />

        <div className="mt-5">
          {isLoading ? (
            <div className="events-loading">
              <div className="events-loading__spinner">
                <div className="events-spinner" aria-label="Loading events" />
              </div>
            </div>
          ) : (
            <EventsGrid key={category} events={memoizedEvents} category={category} />
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
