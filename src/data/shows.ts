/**
 * Proshows schedule data — Day 1, Day 2, Day 3 lineups.
 */

export type ShowItem = {
  id: string;
  title: string;
  subtitle?: string;
  isReveal?: boolean;
  imageUrl?: string;
};

export type ShowDay = {
  day: number;
  label: string;
  shows: ShowItem[];
};

export const PROSHOWS_SCHEDULE: ShowDay[] = [
  {
    day: 1,
    label: 'Day 1',
    shows: [
      {
        id: 'day1-cida',
        title: 'CIDA — CIT Icon of Digital Awards',
        imageUrl: '/cida.webp',
      },
      {
        id: 'day1-music-dance',
        title: "CIT's Music and Dance Team Performance",
        imageUrl: '/images/proshows/dance-and-music.webp',
      },
      {
        id: 'day1-jeeva',
        title: 'Actor Jeeva',
        subtitle: 'Walk-in Guest',
        imageUrl: '/images/proshows/jeeva.webp',
      },
    ],
  },
  {
    day: 2,
    label: 'Day 2',
    shows: [
      {
        id: 'day2-sana',
        title: 'SaNa Concert',
        imageUrl: '/sana 2 copy.webp',
      },
    ],
  },
  {
    day: 3,
    label: 'Day 3',
    shows: [
      {
        id: 'day3-concert',
        title: 'Harsha Vardhan Concert',
        imageUrl: '/harsha-vardhan.webp',
      },
      {
        id: 'day3-dj',
        title: 'DJ NIGHT - DJ DEEPIKA',
        imageUrl: '/dj-deepika.webp',
      },
      {
        id: 'day3-surprise-andrea',
        title: 'ANDREA',
        imageUrl: '/andrea.webp',
      },
      {
        id: 'day3-surprise-atharva',
        title: 'ATHARVA',
        imageUrl: '/atharva.webp',
      },
    ],
  },
];
