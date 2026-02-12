'use client';

/**
 * Editorial Proshows data model.
 *
 * This file builds on top of the existing `PROSHOWS_SCHEDULE` data so we keep
 * a single source of truth for day / lineup information, while shaping it for
 * the new editorial layout components.
 */

import { PROSHOWS_SCHEDULE, type ShowDay, type ShowItem } from '@/data/shows';

export type ProshowArtist = {
  id: string;
  /** Display name, uppercase in UI */
  name: string;
  /** Optional genre / role label, e.g. "Concert", "Awards" */
  genre?: string;
  /** Optional time string, e.g. "7:00 PM" */
  time?: string;
  /** Optional stage or location label */
  stage?: string;
  /** Optional image used when hovering this artist */
  image?: string;
};

export type ProshowDay = {
  /** Stable id used for state and anchors, e.g. "day-1" */
  id: string;
  /** Two-digit day number used for oversized watermark, e.g. "01" */
  dayNumber: string;
  /** Human-readable label like "Day 1" or "DAY 01" */
  label: string;
  /** Optional date string rendered in metadata */
  date?: string;
  /** Optional location string rendered in metadata */
  location?: string;
  /** Registration URL specific to this day */
  registerUrl: string;
  /** Default hero image for the day */
  heroImage: string;
  /** Lineup for the day */
  artists: ProshowArtist[];
};

/**
 * Derive a per-day registration URL.
 * Currently this namespaces by query param so we can keep a single
 * registration page while still having day-specific tracking.
 */
const getRegisterUrlForDay = (showDay: ShowDay) =>
  `/register?day=${encodeURIComponent(showDay.day)}`;

/**
 * Pick a reasonable hero image for the day.
 * Prefer the first show with an image, otherwise fall back to a generic
 * proshows artwork.
 */
const getHeroImageForDay = (showDay: ShowDay): string => {
  const withImage = showDay.shows.find((show) => Boolean(show.imageUrl));
  if (withImage?.imageUrl) return withImage.imageUrl;
  // Fallback to an existing generic proshows artwork path.
  return '/images/proshows/concert.webp';
};

const mapShowToArtist = (show: ShowItem): ProshowArtist => ({
  id: show.id,
  name: show.title,
  // Treat subtitle as a loose genre / role line for now
  genre: show.subtitle,
  image: show.imageUrl,
});

export const PROSHOWS_DAYS: ProshowDay[] = PROSHOWS_SCHEDULE.map((day) => ({
  id: `day-${day.day}`,
  dayNumber: String(day.day).padStart(2, '0'),
  label: day.label,
  // Date / location can be wired in later from config; keep optional for now.
  date: undefined,
  location: undefined,
  registerUrl: getRegisterUrlForDay(day),
  heroImage: getHeroImageForDay(day),
  artists: day.shows.map(mapShowToArtist),
}));

