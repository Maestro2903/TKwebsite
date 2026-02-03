'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import EventCard from './EventCard';
import type { EventItem } from '@/lib/eventsData';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface EventsGridProps {
  events: EventItem[];
  category: 'non-technical' | 'technical';
}

export default function EventsGrid({ events, category }: EventsGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    const cards = gridRef.current.querySelectorAll('.event-card');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, gridRef);

    return () => ctx.revert();
  }, [events, category]);

  const id = category === 'non-technical' ? 'events-grid-non-technical' : 'events-grid-technical';
  const ariaLabelledBy = category === 'non-technical' ? 'tab-non-technical' : 'tab-technical';

  return (
    <div
      ref={gridRef}
      id={id}
      role="tabpanel"
      aria-labelledby={ariaLabelledBy}
      className="events-grid u-container"
    >
      {events.length === 0 ? (
        <p className="events-grid__empty" style={{ gridColumn: '1 / -1', opacity: 0.6, textAlign: 'center', padding: '3rem 1rem' }}>
          No technical events at the moment. Check back soon.
        </p>
      ) : (
        events.map((event) => (
          <EventCard
            key={event.id}
            id={event.id}
            name={event.name}
            description={event.description}
            image={event.image}
          />
        ))
      )}
    </div>
  );
}
