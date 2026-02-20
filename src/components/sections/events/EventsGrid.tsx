'use client';

import { useEffect, useRef, memo } from 'react';
import { useGSAP } from '@/hooks/useGSAP';
import EditorialEventCard from './EditorialEventCard';
import type { EventItem } from '@/data/events';

interface EventsGridProps {
  events: EventItem[];
  category: 'non-technical' | 'technical';
}

function EventsGrid({ events, category }: EventsGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [gsapModules, isLoading] = useGSAP();

  useEffect(() => {
    if (!gridRef.current || isLoading || !gsapModules) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const { gsap, ScrollTrigger } = gsapModules;

    // Ensure ScrollTrigger is registered before using it
    if (!ScrollTrigger) {
      console.warn('ScrollTrigger not available, skipping animation');
      return;
    }

    const cards = gridRef.current.querySelectorAll('.event-card');
    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
        {
          opacity: 1,
          y: 0,
          duration: prefersReducedMotion ? 0.01 : 0.8,
          ease: 'power3.out',
          stagger: prefersReducedMotion ? 0 : 0.1,
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }, gridRef);

    return () => ctx.revert();
  }, [events, category, isLoading, gsapModules]);

  const id = category === 'non-technical' ? 'events-grid-non-technical' : 'events-grid-technical';
  const ariaLabelledBy = category === 'non-technical' ? 'tab-non-technical' : 'tab-technical';

  return (
    <div
      ref={gridRef}
      id={id}
      role="tabpanel"
      aria-labelledby={ariaLabelledBy}
      className="events-grid events-grid--editorial u-container"
    >
      {events.length === 0 ? (
        <p
          className="events-grid__empty"
          role="status"
          aria-live="polite"
          style={{ gridColumn: '1 / -1', opacity: 0.6, textAlign: 'center', padding: '3rem 1rem' }}
        >
          No {category === 'non-technical' ? 'non-technical' : 'technical'} events at the moment. Check back soon.
        </p>
      ) : (
        events.map((event, index) => (
          <EditorialEventCard key={event.id} event={event} index={index} />
        ))
      )}
    </div>
  );
}

export default memo(EventsGrid);
