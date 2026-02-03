'use client';

import { useCallback } from 'react';
import { PROSHOWS_SCHEDULE } from '@/lib/showsData';
import ShowCard from '@/components/ShowCard';

export default function ShowsSchedule() {
  const scrollToDay = useCallback((day: number) => {
    const el = document.getElementById(`day-${day}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <section className="shows-schedule u-section" aria-labelledby="shows-schedule-heading">
      <h2 id="shows-schedule-heading" className="u-sr-only">
        Proshows schedule by day
      </h2>

      {/* Sticky day nav — Saarang-style */}
      <nav className="shows-schedule__day-nav" aria-label="Jump to day">
        <div className="shows-schedule__day-nav-inner u-container">
          {PROSHOWS_SCHEDULE.map((dayBlock) => (
            <button
              key={dayBlock.day}
              type="button"
              className="shows-schedule__day-nav-btn"
              onClick={() => scrollToDay(dayBlock.day)}
              aria-label={`Go to ${dayBlock.label}`}
            >
              {dayBlock.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="shows-schedule__eyebrow u-container">
        <div className="eyebrow_layout">
          <div className="eyebrow_marker" aria-hidden />
          <span className="eyebrow_text u-text-style-main">LINEUP</span>
        </div>
      </div>

      <div className="shows-schedule__inner">
        {PROSHOWS_SCHEDULE.map((dayBlock) => (
          <article
            key={dayBlock.day}
            className="show-day-section"
            aria-labelledby={`day-${dayBlock.day}-label`}
            id={`day-${dayBlock.day}`}
          >
            <div className="show-day-section__header u-container">
              <span className="show-day-section__num" aria-hidden>
                {String(dayBlock.day).padStart(2, '0')}
              </span>
              <span id={`day-${dayBlock.day}-label`} className="show-day-section__label">
                {dayBlock.label}
              </span>
            </div>
            <div className="show-day-section__cards-scroll">
              <div className="show-day-section__cards">
                {dayBlock.shows.map((show) => (
                  <ShowCard key={show.id} show={show} />
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
