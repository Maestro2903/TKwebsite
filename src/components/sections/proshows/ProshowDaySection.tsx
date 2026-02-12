'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ProshowDay } from '@/data/proshows';
import { BarcodeStripe, EditorialDivider, SectionLabel } from '@/components/decorative/EditorialMotifs';
import { ArtistLineItem } from './ArtistLineItem';
import { DayRegisterButton } from './DayRegisterButton';

interface ProshowDaySectionProps {
  day: ProshowDay;
}

export function ProshowDaySection({ day }: ProshowDaySectionProps) {
  const [hoveredArtistId, setHoveredArtistId] = useState<string | null>(null);

  const activeArtist =
    (hoveredArtistId && day.artists.find((a) => a.id === hoveredArtistId)) || day.artists[0];

  const imageSrc = activeArtist?.image || day.heroImage || '/images/proshows/concert.webp';

  return (
    <section
      id={day.id}
      aria-labelledby={`${day.id}-label`}
      className={cn(
        'relative flex flex-col lg:flex-row lg:items-stretch',
        'border border-[var(--editorial-gray,#333)] bg-[var(--editorial-black,#000)]',
        'text-[var(--editorial-white,#FFF)]',
        'overflow-hidden'
      )}
    >
      {/* Watermark day number */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-4 top-4 text-right text-[72px] sm:text-[104px] xl:text-[240px] font-editorial font-black uppercase tracking-tight leading-none text-white/5 xl:top-8"
      >
        {day.dayNumber}
      </div>

      <div className="relative z-10 flex flex-1 flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9 xl:px-14 xl:py-14">
        {/* Header row */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            <SectionLabel
              id={`${day.id}-label`}
              className="text-[10px] tracking-[0.2em] text-white/50"
            >
              DAY {day.dayNumber} /// LINEUP
            </SectionLabel>
            <div className="flex flex-col gap-1">
              {day.date && (
                <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--editorial-gray,#BBB)]">
                  {day.date}
                </span>
              )}
              {day.location && (
                <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--editorial-gray,#BBB)]">
                  {day.location}
                </span>
              )}
            </div>
          </div>
          <div className="hidden sm:flex w-24 flex-col items-end gap-2">
            <BarcodeStripe variant="horizontal" color="white" className="w-full" />
            <SectionLabel className="text-[9px] tracking-[0.24em] text-[var(--editorial-gray,#999)]">
              LOCATION
            </SectionLabel>
          </div>
        </div>

        <EditorialDivider className="mt-3" />

        {/* Lineup list */}
        <div className="mt-4 flex flex-col border-t border-[var(--editorial-gray,#333)]">
          {day.artists.map((artist, index) => (
            <ArtistLineItem
              key={artist.id}
              artist={artist}
              showDividerAbove={index > 0}
              isHeadliner={index === 0}
              onHover={() => setHoveredArtistId(artist.id)}
              onBlur={() => setHoveredArtistId(null)}
            />
          ))}
        </div>
      </div>

      {/* Right: day-specific image that reacts to hover */}
      <div className="relative flex-1 border-t border-[var(--editorial-gray,#333)] lg:max-w-sm lg:border-t-0 lg:border-l lg:border-[var(--editorial-gray,#333)]">
        <div className="relative aspect-[4/5] w-full bg-black xl:p-6 lg:h-full">
          <Image
            src={imageSrc}
            alt={activeArtist?.name || `Proshows Day ${day.dayNumber}`}
            fill
            className="object-cover grayscale"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 32vw"
          />
        </div>
      </div>

      {/* Single CTA for the day */}
      <DayRegisterButton
        href={day.registerUrl}
        label={`REGISTER FOR DAY ${day.dayNumber}`}
        subLabel={day.date}
      />
    </section>
  );
}

