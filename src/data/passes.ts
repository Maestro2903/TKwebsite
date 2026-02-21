import type { PassType } from '@/lib/db/firestoreTypes';

/**
 * Pass options for the Registration page.
 */

export type RegistrationPass = {
  id: string;
  passType: PassType;
  amount: number;
  emoji: string;
  title: string;
  price: string;
  details: string;
  meta: string[];
  /** e.g. "PER DAY", "PER MEMBER", "TOTAL" */
  priceLabel?: string;
  /** 2x2 info grid for the card (label + value pairs) */
  includes?: { label: string; value: string }[];
  /** One-line "best for" description for footer */
  bestFor?: string;
};

export const REGISTRATION_PASSES: RegistrationPass[] = [
  {
    id: 'day-pass',
    passType: 'day_pass',
    amount: 500,
    emoji: '🎟️',
    title: 'DAY PASS',
    price: '₹500',
    priceLabel: 'PER DAY',
    details: 'Single day access to events and campus activities.',
    meta: [
      'Ideal for individual participants',
      'Valid for any one day',
    ],
    includes: [
      { label: 'ACCESS', value: '1 DAY' },
      { label: 'EVENTS', value: 'ALL' },
      { label: 'ENTRY', value: 'QR' },
      { label: 'CAMPUS', value: 'FULL' },
    ],
    bestFor: 'Individual participants attending for one day',
  },
  {
    id: 'group-events-pass',
    passType: 'group_events',
    amount: 250,
    emoji: '👥',
    title: 'GROUP EVENTS PASS',
    price: '₹250 / person',
    priceLabel: 'PER MEMBER',
    details: 'Special registration for group-based events.',
    meta: [
      'Applicable only for group events',
      'Team registration required',
    ],
    includes: [
      { label: 'EVENTS', value: 'GROUP' },
      { label: 'TEAM', value: 'FULL' },
      { label: 'CHECK-IN', value: 'VENUE' },
      { label: 'REGISTER', value: 'TEAM' },
    ],
    bestFor: 'Teams in coding, gaming, robotics challenges',
  },
  {
    id: 'proshow-pass',
    passType: 'proshow',
    amount: 1500,
    emoji: '🎤',
    title: 'PROSHOW PASS (DAY 1 + DAY 3)',
    price: '₹1500',
    priceLabel: 'TOTAL',
    details: 'Access to Day 1 and Day 3 Proshows.',
    meta: [
      'Covers both proshow nights',
      'Event access not included',
    ],
    includes: [
      { label: 'DAY 1', value: 'YES' },
      { label: 'DAY 3', value: 'YES' },
      { label: 'CONCERT', value: 'STAGE' },
      { label: 'ENTRY', value: 'QR' },
    ],
    bestFor: 'Attendees for Proshow performances',
  },
  {
    id: 'all-access-pass',
    passType: 'sana_concert',
    amount: 2000,
    emoji: '🎶',
    title: 'ALL-ACCESS PASS (BEST VALUE)',
    price: '₹2000',
    priceLabel: 'TOTAL',
    details: 'This premium pass gives you access to all three days of TAKSHASHILA with CIDA, SaNa The One and Day 3 concert.',
    meta: [
      'All 3 days of TAKSHASHILA',
      'CIDA • SaNa The One • Day 3 concert',
    ],
    includes: [
      { label: 'DAYS', value: 'ALL 3' },
      { label: 'CIDA', value: 'YES' },
      { label: 'SaNa', value: 'CONCERT' },
      { label: 'TIER', value: 'PREMIUM' },
    ],
    bestFor: 'Full festival experience without limits',
  },
];
