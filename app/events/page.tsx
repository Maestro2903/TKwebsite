'use client';

import { useState } from 'react';
import Footer from '@/components/layout/Footer';
import { EventsHero } from '@/components/sections/events/EventsHero';
import EventCategorySwitch from '@/components/sections/events/EventCategorySwitch';
import EventsGrid from '@/components/sections/events/EventsGrid';
import { NON_TECHNICAL_EVENTS, TECHNICAL_EVENTS } from '@/data/events';

export default function EventsPage() {
  const [category, setCategory] = useState<'non-technical' | 'technical'>('non-technical');

  const events = category === 'non-technical' ? NON_TECHNICAL_EVENTS : TECHNICAL_EVENTS;

  return (
    <>
      <main id="main" className="page_main page_main--events page_main--events-editorial relative z-10 bg-[var(--editorial-black,#000)]">
        <EventsHero />

        <section className="events-filter-section">
          <EventCategorySwitch value={category} onChangeAction={setCategory} />
        </section>

        <div className="events-content-shell mt-5">
          <EventsGrid key={category} events={events} category={category} />
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
