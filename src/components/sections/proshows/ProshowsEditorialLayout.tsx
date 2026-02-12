'use client';

import { PROSHOWS_DAYS } from '@/data/proshows';
import { ProshowsHero } from './ProshowsHero';
import { ProshowDaySection } from './ProshowDaySection';

/**
 * Desktop-first editorial layout for the Proshows page.
 * Hero + per-day poster blocks with a single REGISTER CTA per day.
 */
export function ProshowsEditorialLayout() {
  return (
    <div className="relative bg-[var(--editorial-black,#000)] text-[var(--editorial-white,#FFF)]">
      {/* Desktop vertical guideline */}
      <div className="pointer-events-none absolute inset-y-24 left-1/2 hidden w-px -translate-x-1/2 bg-white/5 xl:block" />

      <ProshowsHero days={PROSHOWS_DAYS} />

      <section
        aria-label="Proshows by day"
        className="u-section border-t border-[var(--editorial-gray,#333)]"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14 xl:pt-36 xl:pb-32">
          {/* Section micro label */}
          <div className="mb-6 flex items-center justify-between gap-4 xl:mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
              PROSHOWS /// DAILY LINEUP
            </p>
            <div className="hidden h-px flex-1 bg-white/10 sm:block" />
          </div>

          {/* Mobile / tablet: stacked cards */}
          <div className="flex flex-col gap-8 xl:hidden">
            {PROSHOWS_DAYS.map((day) => (
              <ProshowDaySection
                key={day.id}
                day={day}
              />
            ))}
          </div>

          {/* Desktop: poster grid layout */}
          <div className="hidden xl:grid xl:max-w-[1200px] xl:grid-cols-2 xl:gap-x-16 xl:gap-y-28 xl:mx-auto">
            {PROSHOWS_DAYS.map((day, index) => {
              const baseClasses =
                index === 0
                  ? 'xl:col-span-1'
                  : index === 1
                    ? 'xl:col-span-1 xl:mt-16'
                    : 'xl:col-span-2 xl:max-w-3xl xl:mx-auto xl:mt-4';

              return (
                <div key={day.id} className={baseClasses}>
                  <ProshowDaySection day={day} />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

