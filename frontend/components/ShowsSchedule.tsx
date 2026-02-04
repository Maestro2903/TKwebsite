'use client';

import { memo, useMemo } from 'react';
import { PROSHOWS_SCHEDULE } from '@/lib/showsData';
import ShowCard from '@/components/ShowCard';

function ShowsSchedule() {
  // Memoize schedule to prevent re-renders (though it's a constant, this ensures stability)
  const schedule = useMemo(() => PROSHOWS_SCHEDULE, []);

  return (
    <section className="shows-schedule u-section" aria-labelledby="shows-schedule-heading">
      <h2 id="shows-schedule-heading" className="u-sr-only">
        Proshows schedule by day
      </h2>

      <div className="shows-schedule__inner">
        {schedule.map((dayBlock) => (
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
            <div className="show-day-section__cards u-container">
              {dayBlock.shows.map((show, index) => (
                <ShowCard 
                  key={show.id} 
                  show={show} 
                  day={dayBlock.day}
                  alternate={index % 2 === 1}
                  imageUrl={show.imageUrl}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default memo(ShowsSchedule);
