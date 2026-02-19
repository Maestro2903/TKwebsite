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
  minMembers?: number;
  maxMembers?: number;
};

const PLACEHOLDER_TECH = '/images/event/tech/tech%20quest.webp';

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
    image: '/images/event/nontech/CYPHER.webp',
  },
  {
    id: 'rap-a-thon',
    name: 'RAP-A-THON',
    description:
      'A mic, a beat, and pure fire—showcase your rap skills, flow, and crowd control in this high-voltage performance battle.',
    fullDescription:
      'Step up to the mic—ready to own it? Drop your bars, feel the beat, and take charge of the stage with unstoppable energy. Can you match the rhythm, hype the crowd, and keep the fire alive till the last drop? No holding back, no second chances—this is your moment. Grab it. Feel it. Rule it.',
    image: '/assets/events/rap-a-thon.webp',
  },
  {
    id: 'duo-dance',
    name: 'DUO DANCE',
    description:
      'Two dancers. One vibe. Zero mercy. A power-packed performance driven by sync, chemistry, and stage dominance.',
    image: '/duo dance - final.webp',
    minMembers: 2,
  },
  {
    id: 'solo-singing',
    name: 'SOLO SINGING',
    description:
      'Capture hearts with your voice as emotion, control, and melody blend into a soul-stirring solo performance.',
    image: '/assets/events/solo-singing.webp',
  },
  {
    id: 'load-the-lyrics',
    name: 'LOAD THE LYRICS',
    description:
      "When the lyrics disappear, only memory survives. Stay on beat, think fast, and don't miss a word. One mistake could cost you the game.",
    fullDescription:
      "Identify and complete missing lyrics based on the audio provided. Rely on your listening ability, memory, and understanding of the song. One mistake could cost you the game.",
    image: '/load the lyrics.webp',
  },
  {
    id: 'paint-the-town',
    name: 'CANVAS PAINTING',
    description:
      'Splash, blend, and layer your thoughts into a canvas that breathes color and life. Every stroke builds a mood, every shade shapes a story.',
    image: '/CanvasPainting.webp',
  },
  {
    id: 'gaming-event',
    name: 'GAMING EVENT',
    description:
      'Step into intense virtual battles where strategy, reflexes, and skill decide who rules the game.',
    image: '/gaming event.webp',
  },
  {
    id: 'case-files',
    name: 'CASE FILES',
    description:
      'Crack clues, connect evidence, and race against time in this thrilling mystery-solving challenge inspired by classic detective logic.',
    fullDescription:
      'Think you can outthink the clock and the case? Break down the clues, connect the facts, and make smart decisions under pressure, guided by the calm precision of Hercule Poirot. Will your logic lead you to the truth in time?',
    image: '/casefiles.webp',
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
    minMembers: 2,
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
  },
  {
    id: 'channel-surfing',
    name: 'CHANNEL SURFING',
    description:
      'Blink and you\'ll miss it—catch the clue and answer before the channel changes.',
    fullDescription:
      'Flip through a whirlwind of channels, spot the clues in seconds, and call it out before the screen changes again. From iconic scenes to surprise flashes, your reflexes and pop culture radar will be pushed to the limit. Stay sharp. Hesitate, and the answer disappears.',
    image: '/images/event/nontech/REELTOREAL.webp',
  },
  {
    id: 'frame-spot',
    name: 'FRAME SPOT',
    description:
      'Direct your model and capture a frame where style and attitude come alive.',
    fullDescription:
      'Look closer, chase the details, and connect moments that seem miles apart but belong to the same story. The answers aren\'t handed to you—they\'re hidden in plain sight, waiting for sharp eyes and sharper minds. Can you piece it together before the picture slips away?',
    image: '/images/event/nontech/REELTOREAL.webp',
    minMembers: 2,
  },
];

export const TECHNICAL_EVENTS: EventItem[] = [
  {
    id: 'deadlock',
    name: 'DEADLOCK',
    description:
      'A head-to-head coding battle across five progressive levels of logic, debugging, and algorithmic challenges. Speed, accuracy, and teamwork decide who breaks the deadlock and wins.',
    image: TECH.deadlock,
  },
  {
    id: 'crack-the-code',
    name: 'CRACK THE CODE',
    description:
      'A reverse-engineering coding challenge where participants are given only inputs, outputs, and constraints—without the problem statement. Teams must decode the hidden logic, identify the underlying problem, and write accurate code.',
    image: PLACEHOLDER_TECH,
  },
  {
    id: 'foss-treasure-hunt',
    name: 'FOSS TREASURE HUNT (CAMPUS EDITION)',
    description:
      'An interactive, team-based activity designed to engage students in a fun and intellectually stimulating exploration of Free and Open Source Software (FOSS) concepts. Teams navigate the campus by solving clues rooted in basic Linux commands, Git concepts, and logical puzzles.',
    image: PLACEHOLDER_TECH,
  },
  {
    id: 'mlops-workshop',
    name: 'MLOPS – WHAT\'S AFTER MODEL TRAINING?',
    description:
      'A beginner-friendly workshop introducing MLOps (Machine Learning Operations), focusing on building intuition around how ML models are packaged, deployed, and monitored. The session uses simple explanations and light demonstrations without diving into complex mathematics or advanced tools.',
    image: PLACEHOLDER_TECH,
  },
  {
    id: 'prompt-pixel',
    name: 'PROMPT PIXEL',
    description:
      'A fun, hands-on AI event where people learn how to use generative AI to create and interpret images. Teams work together to turn ideas and visuals into good AI prompts, fostering skills in communication and creative thinking.',
    image: TECH.promptPixel,
  },
  {
    id: 'building-games-web3',
    name: 'BUILDING GAMES ON WEB3',
    description:
      'A hands-on workshop that walks participants through building a simple blockchain-powered game from scratch using modern Web3 development tools. Participants will build a playable mini-game that interacts with the blockchain, including minting in-game NFTs.',
    image: PLACEHOLDER_TECH,
  },
  {
    id: 'chain-of-lies',
    name: 'CHAIN OF LIES',
    description:
      'A high-intensity strategy and observation game built for sharp minds and fast reactions, inspired by an Among Us-style game with a blockchain twist. Validators must scan and analyze revealed crypto-data to catch the change secretly altered by the Tamperer before time runs out.',
    image: TECH.chainOfLies,
  },
  {
    id: 'model-mastery',
    name: 'MODEL MASTERY',
    description:
      'A high-stakes solo "vibe coding" challenge where you architect a frontend website using Google\'s latest AI tools. You get exactly one attempt (20-minute limit) to craft a precise natural language prompt to command the AI to build a fully functional interface.',
    image: TECH.final,
  },
  {
    id: 'borderland-protocol',
    name: 'BORDERLAND PROTOCOL',
    description:
      'A card-based tech survival event inspired by Alice in Borderland, where card suits represent difficulty (Clubs, Diamonds, Hearts, Spades). Teams face multi-round challenges, and survival depends on performance, strategy, and teamwork, with poor performance leading to eliminations.',
    image: PLACEHOLDER_TECH,
  },
  {
    id: 'mock-global-summit',
    name: 'MOCK GLOBAL SUMMIT: VENEZUELA–GREENLAND CRISIS',
    description:
      'Discussing the geopolitical tensions over the world after the takeover of Venezuela.',
    image: PLACEHOLDER_TECH,
  },
  {
    id: 'exchange-effect',
    name: 'EXCHANGE EFFECT',
    description:
      'A challenge where teams transform a single low-value "seed item" into higher-value assets by exchanging with the public. All trades must be documented via a selfie and the top 10 teams pitch their final asset for official appraisal.',
    image: TECH.exchangeEffect,
  },
  {
    id: 'the-90-minute-ceo',
    name: 'THE 90 MINUTE CEO',
    description:
      'A rapid-fire strategy masterclass where students learn to validate startup ideas and pitch them without writing a single line of code. The session teaches a reverse approach: "Find the Pain, Then Sell the Cure" through modules like "Painkillers vs. Vitamins" and a "Problem Roulette" activity.',
    image: PLACEHOLDER_TECH,
  },
  {
    id: 'astrotrack',
    name: 'ASTROTRACK',
    description:
      'A hands-on astrophysics workshop to introduce participants to the real-world science of astrometry using the professional software Astrometrica. Participants work with actual astronomical image datasets to analyze star fields and detect moving celestial objects like asteroids and Near-Earth Objects.',
    image: TECH.astrotrack,
  },
  {
    id: 'upside-down-ctf',
    name: 'UPSIDE DOWN – THE STRANGEST CTF EVER',
    description:
      'A 5-hour immersive Capture The Flag (CTF) competition designed to challenge participants beyond traditional problem-solving with unconventional twists and layered challenges. Participants explore multiple cybersecurity domains including Reverse Engineering, Forensics, Web Exploitation, and Open Source Intelligence (OSINT).',
    image: TECH.upsideDownCtf,
  },
];
