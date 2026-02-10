'use client';

import { memo, useMemo, useEffect, useRef } from 'react';
import { PROSHOWS_SCHEDULE } from '@/data/shows';
import ShowCard from '@/components/sections/proshows/ShowCard';
import { useGSAP } from '@/hooks/useGSAP';

function ShowsSchedule() {
  const scheduleRef = useRef<HTMLElement>(null);
  const [gsapModules, isLoading] = useGSAP();

  // Memoize schedule to prevent re-renders (though it's a constant, this ensures stability)
  const schedule = useMemo(() => PROSHOWS_SCHEDULE, []);

  useEffect(() => {
    if (isLoading || !gsapModules || !scheduleRef.current) return;
    const { gsap, ScrollTrigger } = gsapModules;

    const animateFrom = (elem: Element, direction?: number) => {
      const dir = direction ?? 1;
      let x = 0;
      let y = dir * 100;
      if (elem.classList.contains('gs_reveal_fromLeft')) {
        x = -100;
        y = 0;
      } else if (elem.classList.contains('gs_reveal_fromRight')) {
        x = 100;
        y = 0;
      }
      gsap.fromTo(
        elem,
        { x, y, autoAlpha: 0 },
        {
          duration: 1.25,
          x: 0,
          y: 0,
          autoAlpha: 1,
          ease: 'expo',
          overwrite: 'auto',
        }
      );
    };

    const hide = (elem: Element) => {
      gsap.set(elem, { autoAlpha: 0 });
    };

    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray<Element>('.gs_reveal', scheduleRef.current);
      elements.forEach((elem) => {
        hide(elem);
        ScrollTrigger.create({
          trigger: elem,
          onEnter: () => animateFrom(elem),
          onEnterBack: () => animateFrom(elem, -1),
          onLeave: () => hide(elem),
        });
      });
    }, scheduleRef);

    return () => ctx.revert();
  }, [isLoading, gsapModules]);

  return (
    <section
      ref={scheduleRef}
      className="shows-schedule u-section"
      aria-labelledby="shows-schedule-heading"
    >
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
