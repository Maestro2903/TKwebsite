'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import EventsHero from '@/components/EventsHero';
import EventCategorySwitch from '@/components/EventCategorySwitch';
import EventsGrid from '@/components/EventsGrid';
import StickyRegisterCTA from '@/components/StickyRegisterCTA';
import { useLenis } from '@/hooks/useLenis';
import { NON_TECHNICAL_EVENTS, TECHNICAL_EVENTS } from '@/lib/eventsData';

export default function EventsPage() {
  useLenis();

  const [category, setCategory] = useState<'non-technical' | 'technical'>('non-technical');
  const events = category === 'non-technical' ? NON_TECHNICAL_EVENTS : TECHNICAL_EVENTS;

  return (
    <>
      <Navigation />

      <main id="main" className="page_main page_main--events">
        <EventsHero />

        <EventCategorySwitch value={category} onChange={setCategory} />

        <div
          data-wf--spacer--section-space="main"
          className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
        />

        <EventsGrid key={category} events={events} category={category} />

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
