/**
 * Event data for Events page.
 * Non-tech images from public/images/event/nontech
 */

export type EventItem = {
  id: string;
  name: string;
  description: string;
  /** Optional full paragraph shown on the event card; falls back to description when not set */
  fullDescription?: string;
  image: string;
  venue?: string;
  startTime?: string;
  endTime?: string;
  minMembers?: number;
  maxMembers?: number;
  /** Event date (e.g., "2026-02-26") */
  date?: string;
  /** Prize pool amount in INR */
  prizePool?: number;
  /** If set, the REGISTER button redirects to this external URL instead of /register */
  externalUrl?: string;
};

const PLACEHOLDER_TECH = '/images/event/tech/tech%20quest.jpg';

/** Tech poster paths (from public/images/event/tech) */
const TECH = {
  deadlock: '/images/event/tech/deadlock.webp',
  astrotrack: '/images/event/tech/astrotrack.webp',
  chainOfLies: '/images/event/tech/chain-of-lies.webp',
  promptPixel: '/images/event/tech/prompt-pixel.webp',
  exchangeEffect: '/images/event/tech/exchange-effect.webp',
  upsideDownCtf: '/images/event/tech/upside-down-ctf.webp',
  final: '/images/event/tech/final.webp',
} as const;

export const NON_TECHNICAL_EVENTS: EventItem[] = [
  {
    id: 'choreo-showcase',
    name: 'CHOREO SHOWCASE',
    description:
      'A high-energy group dance battle where rhythm, coordination, and stage presence come together to tell a powerful story.',
    fullDescription:
      'Own the stage, lock into the beat, and pull the crowd into your story. Every move should spark a reaction—sharp counts, smooth transitions, and powerful formations that keep the audience hooked. Feel the rhythm, play with the energy, and dance with the crowd, not just for them.',
    image: '/assets/events/choreo-showcase.webp',
    venue: 'PARTHA',
    startTime: '10:30 AM',
    endTime: '2:00 PM',
    date: '2026-02-26',
    prizePool: 35000,
    minMembers: 3,
    maxMembers: 8,
  },
  {
    id: 'battle-of-bands',
    name: 'BATTLE OF BANDS',
    description:
      'Inter-college bands face off in a live musical showdown to prove their originality, chemistry, and crowd-commanding sound.',
    fullDescription:
      'Battle of Bands is where sound turns into spectacle, and the stage comes alive with pure musical energy. As inter-college bands clash in a high-voltage live showdown, every beat, riff, and rhythm matters. With originality, coordination, and stage presence on the line, will your band rise above the roar and own the spotlight?',
    image: '/BattleOfBands.webp',
    venue: 'PARTHA',
    startTime: '10:00 AM',
    endTime: '2:00 PM',
    date: '2026-02-27',
    prizePool: 50000,
    minMembers: 3,
    maxMembers: 8,
  },
  {
    id: 'cypher',
    name: 'CYPHER',
    description:
      'A one-on-one freestyle dance battle where raw moves, attitude, and instinct decide who owns the circle.',
    fullDescription:
      'Hear the beat calling? Step forward. Got a move that hits harder than words? Prove it. This is a one-on-one freestyle battle where every step is a statement, and every pause is a challenge. When the circle closes in, will you rise—or get outdanced?',
    image: '/images/event/nontech/cypher.webp',
    venue: 'OUTER OAT',
    startTime: '11:00 AM',
    endTime: '4:00 PM',
    date: '2026-02-27',
    prizePool: 15000,
  },
  {
    id: 'rap-a-thon',
    name: 'RAP-A-THON',
    description:
      'A mic, a beat, and pure fire—showcase your rap skills, flow, and crowd control in this high-voltage performance battle.',
    fullDescription:
      'Step up to the mic—ready to own it? Drop your bars, feel the beat, and take charge of the stage with unstoppable energy. Can you match the rhythm, hype the crowd, and keep the fire alive till the last drop? No holding back, no second chances—this is your moment. Grab it. Feel it. Rule it.',
    image: '/assets/events/rap-a-thon.webp',
    venue: 'OUTER OAT',
    startTime: '10:30 AM',
    endTime: '1:00 PM',
    date: '2026-02-26',
    prizePool: 15000,
  },
  {
    id: 'duo-dance',
    name: 'DUO DANCE',
    description:
      'Two dancers. One vibe. Zero mercy. A power-packed performance driven by sync, chemistry, and stage dominance.',
    image: '/duo dance - final.webp',
    venue: 'KAVERI',
    startTime: '11:00 AM',
    endTime: '3:00 PM',
    date: '2026-02-28',
    prizePool: 25000,
    minMembers: 2,
  },
  {
    id: 'solo-singing',
    name: 'SOLO SINGING',
    description:
      'Capture hearts with your voice as emotion, control, and melody blend into a soul-stirring solo performance.',
    image: '/images/event/nontech/solo-singing.webp',
    venue: 'KAVERI',
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    date: '2026-02-27',
    prizePool: 15000,
  },
  {
    id: 'load-the-lyrics',
    name: 'LOAD THE LYRICS',
    description:
      "When the lyrics disappear, only memory survives. Stay on beat, think fast, and don't miss a word. One mistake could cost you the game.",
    fullDescription:
      "Identify and complete missing lyrics based on the audio provided. Rely on your listening ability, memory, and understanding of the song. One mistake could cost you the game.",
    image: '/load the lyrics.webp',
    venue: 'CLASSROOM',
    startTime: '10:30 AM',
    endTime: '1:00 PM',
    date: '2026-02-27',
    prizePool: 15000,
  },
  {
    id: 'canvas-painting',
    name: 'CANVAS PAINTING',
    description:
      'Splash, blend, and layer your thoughts into a canvas that breathes color and life. Every stroke builds a mood, every shade shapes a story.',
    image: '/CanvasPainting.webp',
    venue: 'CLASSROOM',
    startTime: '10:30 AM',
    endTime: '2:00 PM',
    date: '2026-02-28',
    prizePool: 15000,
  },
  {
    id: 'gaming-event',
    name: 'GAMING EVENT',
    description:
      'Step into intense virtual battles where strategy, reflexes, and skill decide who rules the game.',
    image: '/gaming%20event.webp',
    venue: 'SH 1 / PENNEI HALL',
    date: '2026-02-26',
    prizePool: 25000,
  },
  {
    id: 'case-files',
    name: 'CASE FILES',
    description:
      'Crack clues, connect evidence, and race against time in this thrilling mystery-solving challenge inspired by classic detective logic.',
    fullDescription:
      'Think you can outthink the clock and the case? Break down the clues, connect the facts, and make smart decisions under pressure, guided by the calm precision of Hercule Poirot. Will your logic lead you to the truth in time?',
    image: '/casefiles.webp',
    venue: 'CLASSROOM',
    startTime: '10:30 AM',
    endTime: '2:00 PM',
    date: '2026-02-26',
    prizePool: 20000,
    minMembers: 3,
    maxMembers: 5,
  },
  {
    id: 'treasure-hunt',
    name: 'TREASURE HUNT',
    description:
      'Follow the clues, beat the challenges, and outsmart the unknown in an adventure packed with twists and excitement.',
    fullDescription:
      'A trail of clues, a rush of excitement, and surprises waiting at every turn. What starts as a simple hunt soon pushes teams to rely on sharp eyes and smart moves. With each challenge unlocked, the mystery deepens—because the real thrill lies in not knowing what comes next.',
    image: '/images/event/nontech/TREASURE%20HUNT.webp',
    venue: 'INNER OAT',
    startTime: '10:30 AM',
    date: '2026-02-26',
    prizePool: 40000,
    minMembers: 4,
    maxMembers: 6,
  },
  {
    id: 'filmfinatics',
    name: 'FILM FINATICS',
    description:
      'Turn a simple idea into a powerful short film using creativity, emotion, and cinematic storytelling.',
    fullDescription:
      'Every frame is your playground, and every cut is a flex. Twist a simple idea into a short film bursting with creativity, emotions, and cinematic style. Play with visuals, set the vibe, and make every second on screen count. Ready to roll the camera and steal the spotlight?',
    image: '/FilmFinatics.webp',
    venue: 'KAVERI',
    startTime: '12:00 PM',
    endTime: '2:00 PM',
    date: '2026-02-26',
    prizePool: 30000,
    minMembers: 1,
    maxMembers: 20,
  },
  {
    id: 'designers-onboard',
    name: 'DESIGNERS ONBOARD',
    description:
      'Design lives under pressure as you transform surprise themes into striking digital visuals before time runs out.',
    fullDescription:
      'A surprise theme, a ticking clock, and creativity under pressure. Design live, think fast, and turn bold ideas into eye-catching digital visuals using your skills and tools. Can you adapt, create, and stand out before time runs out?',
    image: '/designersonboard.webp',
    venue: 'DAIMER LAB',
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    date: '2026-02-28',
    prizePool: 20000,
  },
  {
    id: 'channel-surfing',
    name: 'CHANNEL SURFING',
    description:
      'Blink and you\'ll miss it—catch the clue and answer before the channel changes.',
    fullDescription:
      'Flip through a whirlwind of channels, spot the clues in seconds, and call it out before the screen changes again. From iconic scenes to surprise flashes, your reflexes and pop culture radar will be pushed to the limit. Stay sharp. Hesitate, and the answer disappears.',
    image: '/images/event/nontech/REELTOREAL.webp',
    venue: 'OUTER OAT',
    startTime: '10:30 AM',
    endTime: '12:30 PM',
    date: '2026-02-28',
    prizePool: 10000,
  },
  {
    id: 'frame-spot',
    name: 'FRAME SPOT',
    description:
      'Direct your model and capture a frame where style and attitude come alive.',
    fullDescription:
      'Look closer, chase the details, and connect moments that seem miles apart but belong to the same story. The answers aren\'t handed to you—they\'re hidden in plain sight, waiting for sharp eyes and sharper minds. Can you piece it together before the picture slips away?',
    image: '/images/event/nontech/REELTOREAL.webp',
    venue: 'CAMPUS',
    startTime: '10:30 AM',
    endTime: '2:00 PM',
    date: '2026-02-26',
    prizePool: 10000,
    minMembers: 2,
  },
  {
    id: 'entrepreneurship-talks',
    name: 'ENTREPRENEURSHIP TALKS',
    description: 'Learn the secrets of successful startups and business scaling from industry experts.',
    image: '/images/event/nontech/REELTOREAL.webp',
    venue: 'CITIL',
    startTime: '10:30 AM',
    endTime: '11:30 AM',
    date: '2026-02-26',
    prizePool: 0,
  },
  {
    id: 'finance-trading',
    name: 'FINANCE & TRADING',
    description: 'A deep dive into stock markets, trading strategies, and financial management.',
    image: '/images/event/nontech/REELTOREAL.webp',
    venue: 'CITIL',
    startTime: '12:00 PM',
    endTime: '1:30 PM',
    date: '2026-02-26',
    prizePool: 0,
  },
  {
    id: 'modelling',
    name: 'MODELLING',
    description: 'Showcase your walk, style, and attitude on the ramp in this high-fashion showdown.',
    image: '/images/event/nontech/REELTOREAL.webp',
    venue: 'F5',
    startTime: '11:00 AM',
    endTime: '1:00 PM',
    date: '2026-02-26',
    prizePool: 0,
  },
  {
    id: 'film-making',
    name: 'FILM MAKING',
    description: 'The art of visual storytelling, from script to screen.',
    image: '/images/event/nontech/REELTOREAL.webp',
    venue: 'F5',
    startTime: '10:30 AM',
    endTime: '12:30 PM',
    date: '2026-02-27',
    prizePool: 0,
    minMembers: 2,
  },
  {
    id: 'vision-board-workshop',
    name: 'VISION BOARD WORKSHOP',
    description: 'Visualize your dreams and manifest your future through creative collaging.',
    image: '/images/event/nontech/REELTOREAL.webp',
    venue: 'F6',
    startTime: '11:30 AM',
    endTime: '1:00 PM',
    date: '2026-02-27',
    prizePool: 0,
  },
  {
    id: 'make-up-workshop',
    name: 'MAKE-UP WORKSHOP',
    description: 'Master the techniques of professional makeup and skincare.',
    image: '/images/event/nontech/REELTOREAL.webp',
    venue: 'F5',
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    date: '2026-02-28',
    prizePool: 0,
  },
  {
    id: 'photography-workshop',
    name: 'PHOTOGRAPHY WORKSHOP',
    description: 'Learn the fundamentals of framing, lighting, and post-processing from the pros.',
    image: '/images/event/nontech/REELTOREAL.webp',
    venue: 'F6',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    date: '2026-02-28',
    prizePool: 0,
  },
  {
    id: 'branding',
    name: 'BRANDING',
    description: 'The strategy and design behind building iconic identities.',
    image: '/images/event/nontech/REELTOREAL.webp',
    venue: 'F7',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    date: '2026-02-28',
    prizePool: 0,
  },
];

export const TECHNICAL_EVENTS: EventItem[] = [
  {
    id: 'upside-down-ctf',
    name: 'UPSIDE DOWN – THE STRANGEST CTF EVER',
    description:
      'A 5-hour immersive Capture The Flag (CTF) competition designed to challenge participants beyond traditional problem-solving with unconventional twists and layered challenges.',
    image: TECH.upsideDownCtf,
    venue: 'Python Lab',
    startTime: '9:00 AM',
    endTime: '3:00 PM',
    date: '2026-02-26',
    prizePool: 40000,
  },
  {
    id: 'deadlock',
    name: 'DEADLOCK',
    description:
      'A head-to-head coding battle across five progressive levels of logic, debugging, and algorithmic challenges. Speed, accuracy, and teamwork decide who breaks the deadlock and wins.',
    image: TECH.deadlock,
    venue: 'Pega Lab',
    startTime: '10:00 AM',
    date: '2026-02-26',
    prizePool: 35000,
  },
  {
    id: 'borderland-protocol',
    name: 'BORDERLAND PROTOCOL',
    description:
      'A card-based tech survival event inspired by Alice in Borderland, where card suits represent difficulty (Clubs, Diamonds, Hearts, Spades). Teams face multi-round challenges, and survival depends on performance, strategy, and teamwork, with poor performance leading to eliminations.',
    image: '/images/event/tech/borderland.webp',
    venue: 'ILP Lab',
    startTime: '9:00 AM',
    date: '2026-02-26',
    prizePool: 50000,
  },
  {
    id: 'exchange-effect',
    name: 'EXCHANGE EFFECT',
    description:
      'A challenge where teams transform a single low-value "seed item" into higher-value assets by exchanging with the public. All trades must be documented via a selfie and the top 10 teams pitch their final asset for official appraisal.',
    image: TECH.exchangeEffect,
    venue: 'CITIL Lab',
    startTime: '9:00 AM',
    date: '2026-02-26',
    prizePool: 30000,
  },
  {
    id: 'commit-kaaviyam',
    name: 'COMMIT KAAVIYAM',
    description: 'A creative coding challenge that tests your ability to write clean, poetic code.',
    image: PLACEHOLDER_TECH,
    venue: 'CIT Classroom',
    startTime: '10:30 AM',
    endTime: '12:30 PM',
    date: '2026-02-26',
    prizePool: 0,
  },
  {
    id: 'big-data-cse',
    name: 'BIG DATA (CSE)',
    description: 'Explore the vast landscape of data processing and analytics at scale.',
    image: PLACEHOLDER_TECH,
    venue: 'ILP Lab Pega',
    startTime: '1:00 PM',
    date: '2026-02-26',
    prizePool: 0,
  },
  {
    id: 'astrotrack',
    name: 'ASTROTRACK',
    description:
      'A hands-on astrophysics workshop to introduce participants to the real-world science of astrometry using the professional software Astrometrica. Participants work with actual astronomical image datasets to analyze star fields and detect moving celestial objects like asteroids and Near-Earth Objects.',
    image: TECH.astrotrack,
    venue: 'Physics Lab',
    startTime: '9:00 AM',
    endTime: '10:30 AM',
    date: '2026-02-26',
    prizePool: 0,
  },
  {
    id: 'mlops-workshop',
    name: 'MLOPS – WHAT\'S AFTER MODEL TRAINING?',
    description:
      'A beginner-friendly workshop introducing MLOps (Machine Learning Operations), focusing on building intuition around how ML models are packaged, deployed, and monitored. The session uses simple explanations and light demonstrations without diving into complex mathematics or advanced tools.',
    image: PLACEHOLDER_TECH,
    venue: 'CSE Labs',
    date: '2026-02-26',
    prizePool: 0,
  },
  {
    id: 'prompt-pixel',
    name: 'PROMPT PIXEL',
    description:
      'A fun, hands-on AI event where people learn how to use generative AI to create and interpret images. Teams work together to turn ideas and visuals into good AI prompts, fostering skills in communication and creative thinking.',
    image: '/images/event/tech/prompt-pixel.webp',
    venue: 'AI Lab',
    startTime: '1:00 PM',
    date: '2026-02-27',
    prizePool: 20000,
  },
  {
    id: 'mock-global-summit',
    name: 'MOCK GLOBAL SUMMIT: VENEZUELA–GREENLAND CRISIS',
    description:
      'Discussing the geopolitical tensions over the world after the takeover of Venezuela.',
    image: PLACEHOLDER_TECH,
    venue: 'Auditorium',
    startTime: '9:00 AM',
    date: '2026-02-27',
    prizePool: 20000,
  },
  {
    id: 'digital-detective',
    name: 'DIGITAL DETECTIVE',
    description: 'Follow the digital breadcrumbs to solve complex cyber mysteries.',
    image: '/images/event/tech/digital-detective.webp',
    venue: 'CIT Lab (CS)',
    startTime: '10:00 AM',
    date: '2026-02-27',
    prizePool: 0,
  },
  {
    id: 'click2cash',
    name: 'CLICK 2 CASH',
    description: 'Master the art of e-commerce and digital marketing to drive revenue.',
    image: PLACEHOLDER_TECH,
    venue: 'CITIL',
    startTime: '11:30 AM',
    date: '2026-02-27',
    prizePool: 0,
  },
  {
    id: 'industrial-automation',
    name: 'INDUSTRIAL AUTOMATION (MCT)',
    description: 'The future of manufacturing through robotics and PLC programming.',
    image: PLACEHOLDER_TECH,
    venue: 'IA Lab',
    startTime: '11:00 AM',
    date: '2026-02-27',
    prizePool: 0,
  },
  {
    id: 'aero-modelling',
    name: 'AERO MODELLING',
    description: 'Design, build, and fly your own model aircraft in this sky-high event.',
    image: PLACEHOLDER_TECH,
    venue: 'Drone CoE',
    startTime: '12:00 PM',
    date: '2026-02-27',
    prizePool: 0,
  },
  {
    id: 'electrodes-to-signals',
    name: 'ELECTRODES TO SIGNALS',
    description: 'Understanding the bio-electrical signals through modern electronics.',
    image: PLACEHOLDER_TECH,
    venue: 'ILP 3rd Floor',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    date: '2026-02-27',
    prizePool: 0,
  },
  {
    id: 'crack-the-code',
    name: 'CRACK THE CODE',
    description:
      'A reverse-engineering coding challenge where participants are given only inputs, outputs, and constraints—without the problem statement. Teams must decode the hidden logic, identify the underlying problem, and write accurate code.',
    image: PLACEHOLDER_TECH,
    venue: 'IT Labs',
    date: '2026-02-27',
    prizePool: 25000,
  },
  {
    id: 'speedathon',
    name: 'SPEEDATHON',
    description:
      'A fast-paced competitive coding challenge where speed and precision are key. Race against the clock and other participants to solve problems and prove your coding prowess.',
    image: '/images/event/tech/speedathon.webp',
    venue: 'Partha',
    startTime: '8:00 AM',
    endTime: '3:00 PM',
    date: '2026-02-28',
    prizePool: 0,
    externalUrl: 'https://unstop.com/o/GuLmFfw?lb=ku2oIqpo&utm_medium=Share&utm_source=asymmclu9437&utm_campaign=Online_coding_challenge',
  },
  {
    id: 'chain-of-lies',
    name: 'CHAIN OF LIES',
    description:
      'A high-intensity strategy and observation game built for sharp minds and fast reactions, inspired by an Among Us-style game with a blockchain twist. Validators must scan and analyze revealed crypto-data to catch the change secretly altered by the Tamperer before time runs out.',
    image: '/images/event/tech/chain-of-lies.webp',
    venue: 'CIT Lab',
    startTime: '1:00 PM',
    date: '2026-02-28',
    prizePool: 20000,
  },
  {
    id: 'building-games-web3',
    name: 'BUILDING GAMES ON WEB3',
    description:
      'A hands-on workshop that walks participants through building a simple blockchain-powered game from scratch using modern Web3 development tools. Participants will build a playable mini-game that interacts with the blockchain, including minting in-game NFTs.',
    image: PLACEHOLDER_TECH,
    venue: 'ILP Lab pega',
    startTime: '12:30 PM',
    date: '2026-02-28',
    prizePool: 0,
  },
  {
    id: 'escape-room',
    name: 'ESCAPE ROOM',
    description: 'Solve puzzles and unlock mysteries to find your way out before time runs out.',
    image: PLACEHOLDER_TECH,
    venue: 'Pega/AI Lab',
    startTime: '10:30 AM',
    date: '2026-02-28',
    prizePool: 0,
  },
  {
    id: 'soc-investigation',
    name: 'SOC INVESTIGATION',
    description: 'Real-world security operations center simulation and incident response.',
    image: '/images/event/tech/soc-investigation.webp',
    venue: 'Python Lab',
    startTime: '10:30 AM',
    date: '2026-02-28',
    prizePool: 0,
  },
  {
    id: 'model-mastery',
    name: 'MODEL MASTERY',
    description:
      'A high-stakes solo "vibe coding" challenge where you architect a frontend website using Google\'s latest AI tools. You get exactly one attempt (20-minute limit) to craft a precise natural language prompt to command the AI to build a fully functional interface.',
    image: TECH.final,
    venue: 'CSE Labs',
    date: '2026-02-28',
    prizePool: 25000,
  },
  {
    id: 'the-90-minute-ceo',
    name: 'THE 90 MINUTE CEO',
    description:
      'A rapid-fire strategy masterclass where students learn to validate startup ideas and pitch them without writing a single line of code. The session teaches a reverse approach: "Find the Pain, Then Sell the Cure" through modules like "Painkillers vs. Vitamins" and a "Problem Roulette" activity.',
    image: PLACEHOLDER_TECH,
    venue: 'Auditorium',
    date: '2026-02-28',
    prizePool: 0,
  },
];
