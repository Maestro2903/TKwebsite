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
};

export const REGISTRATION_PASSES: RegistrationPass[] = [
  {
    id: 'day-pass',
    passType: 'day_pass',
    amount: 500,
    emoji: '🎟️',
    title: 'DAY PASS',
    price: '₹500',
    details: 'Single day access to events and campus activities.',
    meta: [
      'Ideal for individual participants',
      'Valid for any one day',
    ],
  },
  {
    id: 'group-events-pass',
    passType: 'group_events',
    amount: 250,
    emoji: '👥',
    title: 'GROUP EVENTS PASS',
    price: '₹250 / person',
    details: 'Special registration for group-based events.',
    meta: [
      'Applicable only for group events',
      'Team registration required',
    ],
  },
  {
    id: 'proshow-pass',
    passType: 'proshow',
    amount: 1500,
    emoji: '🎤',
    title: 'PROSHOW PASS (DAY 1 + DAY 3)',
    price: '₹1500',
    details: 'Access to Day 1 and Day 3 Proshows.',
    meta: [
      'Covers both proshow nights',
      'Event access not included',
    ],
  },
  {
    id: 'all-access-pass',
    passType: 'sana_concert',
    amount: 2000,
    emoji: '🎶',
    title: 'ALL-ACCESS PASS (BEST VALUE)',
    price: '₹2000',
    details: 'Complete festival access including all 3 days and the Sana Concert.',
    meta: [
      'Best value pass',
      'Includes all events & concerts',
    ],
  },
];
