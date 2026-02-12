'use client';

import type { ProshowDay } from '@/data/proshows';
import { BarcodeStripe, EditorialDivider, SectionLabel } from '@/components/decorative/EditorialMotifs';

interface ProshowsHeroProps {
  days: ProshowDay[];
}

const HEADLINE = 'THREE DAYS OF STARS';

export function ProshowsHero({ days }: ProshowsHeroProps) {
  const firstDay = days[0];

  return (
    <section className="u-section border-b border-[var(--editorial-gray,#333)] bg-[var(--editorial-black,#000)] text-[var(--editorial-white,#FFF)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 xl:grid xl:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)] xl:items-end xl:gap-16">
        {/* Left: copy & headline */}
        <div className="flex max-w-3xl flex-1 flex-col gap-5">
          <div className="flex items-center justify-between gap-6">
            <SectionLabel className="text-[var(--editorial-gray,#AAA)]">
              PROSHOWS /// TAKSHASHILA
            </SectionLabel>
            <BarcodeStripe variant="horizontal" color="white" className="hidden w-32 sm:block" />
          </div>

          <h1 className="font-editorial text-[32px] sm:text-[40px] lg:text-[52px] xl:text-[clamp(5rem,7vw,8rem)] font-black uppercase leading-[0.88] tracking-[-0.04em]">
            <span className="block">THREE DAYS</span>
            <span className="block">OF STARS</span>
          </h1>

          <div className="max-w-xl text-[14px] leading-relaxed text-white/60">
            <p>
              Three nights of amplified sound, monochrome light, and headline acts.
              A poster-wall of performers, stitched into one electric arena.
            </p>
          </div>

          <EditorialDivider label="LINEUP OVERVIEW" className="mt-3 max-w-md" />

          {firstDay && (
            <div className="mt-2 grid grid-cols-2 gap-3 text-[11px] uppercase tracking-[0.18em] text-white/60 sm:max-w-md">
              <div className="flex flex-col gap-1">
                <span className="font-editorial text-[10px] tracking-[0.2em] text-white/50">
                  OPENING DAY
                </span>
                <span>{`DAY ${firstDay.dayNumber}`}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-editorial text-[10px] tracking-[0.2em] text-white/50">
                  HEADLINER
                </span>
                <span>{firstDay.artists[0]?.name ?? 'To be revealed'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: schedule snapshot box (desktop-only) */}
        {days.length > 0 && (
          <aside className="mt-8 hidden xl:block">
            <div className="border border-white/40 px-8 py-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <BarcodeStripe variant="horizontal" color="white" className="h-6 flex-1 opacity-80" />
              </div>
              <SectionLabel className="text-[10px] tracking-[0.2em] text-white/50">
                SCHEDULE SNAPSHOT
              </SectionLabel>
              <div className="mt-4 space-y-2 text-[12px] uppercase tracking-[0.18em] text-white/70">
                {days.map((day) => {
                  const headliner = day.artists[0]?.name ?? 'Headliner TBA';
                  return (
                    <div key={day.id} className="flex items-baseline justify-between gap-3">
                      <span className="font-editorial">
                        DAY {day.dayNumber}
                      </span>
                      <span className="text-right text-[11px] tracking-[0.22em] text-white/60">
                        {headliner}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}

