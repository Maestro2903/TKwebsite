'use client';

/**
 * Cinematic Proshows Layout
 * 
 * Full-bleed hero + redesigned dark theme content sections
 * with shows grouped by day and one register button per day.
 */

import { CinematicHero } from './CinematicHero';
import { ProshowDayGroup } from './ProshowDayGroup';
import { CINEMATIC_HERO } from '@/data/cinematic-proshows';
import { PROSHOWS_SCHEDULE } from '@/data/shows';

export function CinematicProshowsLayout() {
  // Group shows by day
  const dayGroups = PROSHOWS_SCHEDULE.map((day) => ({
    day: day.day,
    dayLabel: `DAY ${String(day.day).padStart(2, '0')}`,
    dateText: day.label.toUpperCase(),
    registerLink: `/register?day=${encodeURIComponent(day.day)}`,
    shows: day.shows.map((show) => ({
      id: show.id,
      title: show.title,
      dayLabel: `DAY ${String(day.day).padStart(2, '0')}`,
      dateText: day.label.toUpperCase(),
      description: show.subtitle || '',
      poster: show.imageUrl || '/images/proshows/concert.webp',
      registerLink: `/register?day=${encodeURIComponent(day.day)}`,
    })),
  }));

  return (
    <div className="relative bg-black text-white">
      {/* Full-bleed Hero - KEPT UNCHANGED */}
      <CinematicHero
            backgroundImage={CINEMATIC_HERO.backgroundImage}
            mobileBackgroundImage={CINEMATIC_HERO.mobileBackgroundImage}
          />

      {/* Main Content - Redesigned Dark Theme */}
      <main className="proshows-main-content">
        <div className="proshows-content-wrapper">
          {dayGroups.map((dayGroup) => (
            <ProshowDayGroup
              key={dayGroup.day}
              day={dayGroup.day}
              dayLabel={dayGroup.dayLabel}
              dateText={dayGroup.dateText}
              shows={dayGroup.shows}
              registerLink={dayGroup.registerLink}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
