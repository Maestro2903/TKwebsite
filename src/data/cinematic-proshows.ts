'use client';

/**
 * Cinematic Proshows Data Model
 * 
 * This file defines the data structure for the cinematic proshows section,
 * featuring a hero poster and landscape proshow cards.
 */

import { PROSHOWS_SCHEDULE } from '@/data/shows';

export type CinematicHeroData = {
  title: string;
  backgroundImage: string;
};

export type CinematicProshowData = {
  id: string;
  title: string;
  dayLabel: string;
  dateText: string;
  description: string;
  poster: string;
  registerLink: string;
};

/**
 * Hero data for the proshows page
 */
export const CINEMATIC_HERO: CinematicHeroData = {
  title: 'Proshows',
  backgroundImage: '/RCTKFINAL.webp',
};

/**
 * Transform schedule data to cinematic proshow cards
 */
export const CINEMATIC_PROSHOWS: CinematicProshowData[] = PROSHOWS_SCHEDULE.flatMap((day) =>
  day.shows.map((show) => ({
    id: show.id,
    title: show.title,
    dayLabel: `DAY ${String(day.day).padStart(2, '0')}`,
    dateText: day.label.toUpperCase(),
    description: show.subtitle || 'Join us for an unforgettable performance',
    poster: show.imageUrl || '/images/proshows/concert.webp',
    registerLink: `/register?day=${encodeURIComponent(day.day)}`,
  }))
);
