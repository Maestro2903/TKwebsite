/**
 * Script to seed events collection in Firestore
 * 
 * This script takes event data from src/data/events.ts and populates
 * the Firestore events collection with proper schema including:
 * - Event categorization (technical/non_technical)
 * - Event types (individual/group/workshop)
 * - Event dates (Day 1: 2026-02-26, Day 2: 2026-02-27, Day 3: 2026-02-28)
 * - Pass type eligibility
 * 
 * Run with: node scripts/db/seed-events.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env or .env.local file
function loadEnv() {
  // Try .env first, then .env.local
  const envFiles = [
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../.env.local')
  ];

  for (const envPath of envFiles) {
    if (fs.existsSync(envPath)) {
      console.log(`📄 Loading environment from: ${path.basename(envPath)}`);
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          let key = match[1].trim();
          let val = match[2].trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
          process.env[key] = val.replace(/\\n/g, '\n');
        }
      });
      return; // Stop after loading first found file
    }
  }

  console.warn('⚠️  No .env or .env.local file found');
}

loadEnv();

// Initialize Firebase Admin
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (serviceAccountKey) {
  console.log('🔐 Using FIREBASE_SERVICE_ACCOUNT_KEY from environment...\n');
  try {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountKey)) });
  } catch (error) {
    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
    process.exit(1);
  }
} else {
  console.log('🔐 Using individual Firebase credentials from environment...\n');

  // Validate required environment variables
  const requiredVars = {
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    'FIREBASE_ADMIN_CLIENT_EMAIL': process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    'FIREBASE_ADMIN_PRIVATE_KEY': process.env.FIREBASE_ADMIN_PRIVATE_KEY
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease ensure one of the following is configured in .env:');
    console.error('  Option 1: FIREBASE_SERVICE_ACCOUNT_KEY (full JSON)');
    console.error('  Option 2: All three variables above\n');
    process.exit(1);
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY
      })
    });
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    console.error('\nPlease check that your credentials are valid.');
    process.exit(1);
  }
}

const db = admin.firestore();

// Event data with proper schema
const events = [
  // ========== NON-TECHNICAL EVENTS - DAY 1 (26 FEB) ==========
  {
    id: 'choreo-showcase',
    name: 'CHOREO SHOWCASE',
    category: 'non_technical',
    type: 'group',
    date: '2026-02-26',
    venue: 'PARTHA',
    startTime: '10:30 AM',
    endTime: '2:00 PM',
    prizePool: 35000,
    allowedPassTypes: ['group_events', 'day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A high-energy group dance battle where rhythm, coordination, and stage presence come together to tell a powerful story.',
    image: '/images/event/nontech/CHOREO%20SHOWCASE.webp',
    minMembers: 3,
    maxMembers: 8,
  },
  {
    id: 'rap-a-thon',
    name: 'RAP-A-THON',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-26',
    venue: 'OUTER OAT',
    startTime: '10:30 AM',
    endTime: '1:00 PM',
    prizePool: 15000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A mic, a beat, and pure fire—showcase your rap skills, flow, and crowd control in this high-voltage performance battle.',
    image: '/images/event/nontech/RAP-A-THON.webp',
  },
  {
    id: 'treasure-hunt',
    name: 'TREASURE HUNT',
    category: 'non_technical',
    type: 'group',
    date: '2026-02-26',
    venue: 'INNER OAT',
    startTime: '10:30 AM',
    prizePool: 40000,
    allowedPassTypes: ['group_events', 'sana_concert'],
    isActive: true,
    description: 'Follow the clues, beat the challenges, and outsmart the unknown in an adventure packed with twists and excitement.',
    image: '/images/event/nontech/TREASURE%20HUNT.webp',
    minMembers: 4,
    maxMembers: 6,
  },
  {
    id: 'case-files',
    name: 'CASE FILES',
    category: 'non_technical',
    type: 'group',
    date: '2026-02-26',
    venue: 'CLASSROOM',
    startTime: '10:30 AM',
    endTime: '2:00 PM',
    prizePool: 20000,
    allowedPassTypes: ['group_events', 'day_pass', 'sana_concert'],
    isActive: true,
    description: 'Crack clues, connect evidence, and race against time in this thrilling mystery-solving challenge inspired by classic detective logic.',
    image: '/images/event/nontech/CASE%20FILES.webp',
    minMembers: 3,
    maxMembers: 5,
  },
  {
    id: 'frame-spot',
    name: 'FRAME SPOT',
    category: 'non_technical',
    type: 'group',
    date: '2026-02-26',
    venue: 'CAMPUS',
    startTime: '10:30 AM',
    endTime: '2:00 PM',
    prizePool: 10000,
    allowedPassTypes: ['group_events', 'day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'Direct your model and capture a frame where style and attitude come alive.',
    image: '/images/event/nontech/REELTOREAL.jpg',
    minMembers: 2,
  },
  {
    id: 'gaming-event',
    name: 'GAMING EVENT',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-26',
    venue: 'SH 1 / PENNEI HALL',
    prizePool: 25000,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'Step into intense virtual battles where strategy, reflexes, and skill decide who rules the game.',
    image: '/images/event/nontech/DESIGNERS%20ONBOARD.webp',
  },
  {
    id: 'filmfinatics',
    name: 'FILM FINATICS',
    category: 'non_technical',
    type: 'group',
    date: '2026-02-26',
    venue: 'KAVERI',
    startTime: '12:00 PM',
    endTime: '2:00 PM',
    prizePool: 30000,
    allowedPassTypes: ['group_events', 'day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'Turn a simple idea into a powerful short film using creativity, emotion, and cinematic storytelling.',
    image: '/images/event/nontech/FILMFINATICS.webp',
    minMembers: 1,
    maxMembers: 20,
  },
  {
    id: 'entrepreneurship-talks',
    name: 'ENTREPRENEURSHIP TALKS',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-26',
    venue: 'CITIL',
    startTime: '10:30 AM',
    endTime: '11:30 AM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'Learn the secrets of successful startups and business scaling from industry experts.',
    image: '/images/event/nontech/REELTOREAL.jpg',
  },
  {
    id: 'finance-trading',
    name: 'FINANCE & TRADING',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-26',
    venue: 'CITIL',
    startTime: '12:00 PM',
    endTime: '1:30 PM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'A deep dive into stock markets, trading strategies, and financial management.',
    image: '/images/event/nontech/REELTOREAL.jpg',
  },
  {
    id: 'modelling',
    name: 'MODELLING',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-26',
    venue: 'F5',
    startTime: '11:00 AM',
    endTime: '1:00 PM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'Showcase your walk, style, and attitude on the ramp in this high-fashion showdown.',
    image: '/images/event/nontech/REELTOREAL.jpg',
  },

  // ========== NON-TECHNICAL EVENTS - DAY 2 (27 FEB) ==========
  {
    id: 'cypher',
    name: 'CYPHER',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'OUTER OAT',
    startTime: '11:00 AM',
    endTime: '4:00 PM',
    prizePool: 15000,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'A one-on-one freestyle dance battle where raw moves, attitude, and instinct decide who owns the circle.',
    image: '/images/event/nontech/CYPHER.webp',
  },
  {
    id: 'battle-of-bands',
    name: 'BATTLE OF BANDS',
    category: 'non_technical',
    type: 'group',
    date: '2026-02-27',
    venue: 'PARTHA',
    startTime: '10:00 AM',
    endTime: '2:00 PM',
    prizePool: 50000,
    allowedPassTypes: ['group_events', 'day_pass', 'sana_concert'],
    isActive: true,
    description: 'Inter-college bands face off in a live musical showdown to prove their originality, chemistry, and crowd-commanding sound.',
    image: '/images/event/nontech/BATTLE%20OF%20BANDS.webp',
    minMembers: 3,
    maxMembers: 8,
  },
  {
    id: 'solo-singing',
    name: 'SOLO SINGING',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'KAVERI',
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    prizePool: 15000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'Capture hearts with your voice as emotion, control, and melody blend into a soul-stirring solo performance.',
    image: '/images/event/nontech/loadthelyrics01.jpg',
  },
  {
    id: 'load-the-lyrics',
    name: 'LOAD THE LYRICS',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'CLASSROOM',
    startTime: '10:30 AM',
    endTime: '1:00 PM',
    prizePool: 15000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: "When the lyrics disappear, only memory survives. Stay on beat, think fast, and don't miss a word. One mistake could cost you the game.",
    image: '/load the lyrics.webp',
  },
  {
    id: 'film-making',
    name: 'FILM MAKING',
    category: 'non_technical',
    type: 'group',
    date: '2026-02-27',
    venue: 'F5',
    startTime: '10:30 AM',
    endTime: '12:30 PM',
    prizePool: 0,
    allowedPassTypes: ['group_events', 'day_pass', 'sana_concert'],
    isActive: true,
    description: 'The art of visual storytelling, from script to screen.',
    image: '/images/event/nontech/REELTOREAL.jpg',
    minMembers: 2,
  },
  {
    id: 'vision-board-workshop',
    name: 'VISION BOARD WORKSHOP',
    category: 'non_technical',
    type: 'workshop',
    date: '2026-02-27',
    venue: 'F6',
    startTime: '11:30 AM',
    endTime: '1:00 PM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'Visualize your dreams and manifest your future through creative collaging.',
    image: '/images/event/nontech/REELTOREAL.jpg',
  },

  // ========== NON-TECHNICAL EVENTS - DAY 3 (28 FEB) ==========
  {
    id: 'duo-dance',
    name: 'DUO DANCE',
    category: 'non_technical',
    type: 'group',
    date: '2026-02-28',
    venue: 'KAVERI',
    startTime: '11:00 AM',
    endTime: '3:00 PM',
    prizePool: 25000,
    allowedPassTypes: ['group_events', 'day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'Two dancers. One vibe. Zero mercy. A power-packed performance driven by sync, chemistry, and stage dominance.',
    image: '/duo dance - final.webp',
    minMembers: 2,
  },
  {
    id: 'canvas-painting',
    name: 'CANVAS PAINTING',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-28',
    venue: 'CLASSROOM',
    startTime: '10:30 AM',
    endTime: '2:00 PM',
    prizePool: 15000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'Splash, blend, and layer your thoughts into a canvas that breathes color and life. Every stroke builds a mood, every shade shapes a story.',
    image: '/CanvasPainting.webp',
  },
  {
    id: 'channel-surfing',
    name: 'CHANNEL SURFING',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-28',
    venue: 'OUTER OAT',
    startTime: '10:30 AM',
    endTime: '12:30 PM',
    prizePool: 10000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'Blink and you\'ll miss it—catch the clue and answer before the channel changes.',
    image: '/images/event/nontech/REELTOREAL.jpg',
  },
  {
    id: 'designers-onboard',
    name: 'DESIGNERS ONBOARD',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-28',
    venue: 'DAIMER LAB',
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    prizePool: 20000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'Design lives under pressure as you transform surprise themes into striking digital visuals before time runs out.',
    image: '/images/event/nontech/DESIGNERS%20ONBOARD.webp',
  },
  {
    id: 'make-up-workshop',
    name: 'MAKE-UP WORKSHOP',
    category: 'non_technical',
    type: 'workshop',
    date: '2026-02-28',
    venue: 'F5',
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'Master the techniques of professional makeup and skincare.',
    image: '/images/event/nontech/REELTOREAL.jpg',
  },
  {
    id: 'photography-workshop',
    name: 'PHOTOGRAPHY WORKSHOP',
    category: 'non_technical',
    type: 'workshop',
    date: '2026-02-28',
    venue: 'F6',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'Learn the fundamentals of framing, lighting, and post-processing from the pros.',
    image: '/images/event/nontech/REELTOREAL.jpg',
  },
  {
    id: 'branding',
    name: 'BRANDING',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-28',
    venue: 'F7',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'The strategy and design behind building iconic identities.',
    image: '/images/event/nontech/REELTOREAL.jpg',
  },

  // ========== TECHNICAL EVENTS - DAY 1 (26 FEB) ==========
  {
    id: 'upside-down-ctf',
    name: 'UPSIDE DOWN – THE STRANGEST CTF EVER',
    category: 'technical',
    type: 'individual',
    date: '2026-02-26',
    venue: 'Python Lab',
    startTime: '9:00 AM',
    endTime: '3:00 PM',
    prizePool: 40000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A 5-hour immersive Capture The Flag (CTF) competition designed to challenge participants beyond traditional problem-solving with unconventional twists and layered challenges.',
    image: '/images/event/tech/upside-down-ctf.jpeg',
  },
  {
    id: 'deadlock',
    name: 'DEADLOCK',
    category: 'technical',
    type: 'individual',
    date: '2026-02-26',
    venue: 'Pega Lab',
    startTime: '10:00 AM',
    prizePool: 35000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A head-to-head coding battle across five progressive levels of logic, debugging, and algorithmic challenges.',
    image: '/images/event/tech/deadlock.jpeg',
  },
  {
    id: 'borderland-protocol',
    name: 'BORDERLAND PROTOCOL',
    category: 'technical',
    type: 'group',
    date: '2026-02-26',
    venue: 'ILP Lab',
    startTime: '9:00 AM',
    prizePool: 50000,
    allowedPassTypes: ['group_events', 'sana_concert'],
    isActive: true,
    description: 'A card-based tech survival event inspired by Alice in Borderland.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'exchange-effect',
    name: 'EXCHANGE EFFECT',
    category: 'technical',
    type: 'group',
    date: '2026-02-26',
    venue: 'CITIL Lab',
    startTime: '9:00 AM',
    prizePool: 30000,
    allowedPassTypes: ['group_events', 'day_pass', 'sana_concert'],
    isActive: true,
    description: 'Transform a single low-value "seed item" into higher-value assets by exchanging with the public.',
    image: '/images/event/tech/exchange-effect.jpeg',
  },
  {
    id: 'commit-kaaviyam',
    name: 'COMMIT KAAVIYAM',
    category: 'technical',
    type: 'individual',
    date: '2026-02-26',
    venue: 'CIT Classroom',
    startTime: '10:30 AM',
    endTime: '12:30 PM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'A creative coding challenge that tests your ability to write clean, poetic code.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'big-data-cse',
    name: 'BIG DATA (CSE)',
    category: 'technical',
    type: 'individual',
    date: '2026-02-26',
    venue: 'ILP Lab Pega',
    startTime: '1:00 PM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'Explore the vast landscape of data processing and analytics at scale.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'astrotrack',
    name: 'ASTROTRACK',
    category: 'technical',
    type: 'workshop',
    date: '2026-02-26',
    venue: 'Physics Lab',
    startTime: '9:00 AM',
    endTime: '10:30 AM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A hands-on astrophysics workshop to introduce participants to the real-world science of astrometry using the professional software Astrometrica.',
    image: '/images/event/tech/astrotrack.jpeg',
  },
  {
    id: 'mlops-workshop',
    name: 'MLOPS – WHAT\'S AFTER MODEL TRAINING?',
    category: 'technical',
    type: 'workshop',
    date: '2026-02-26',
    venue: 'CSE Labs',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A beginner-friendly workshop introducing MLOps.',
    image: '/images/event/tech/tech%20quest.jpg',
  },

  // ========== TECHNICAL EVENTS - DAY 2 (27 FEB) ==========
  {
    id: 'prompt-pixel',
    name: 'PROMPT PIXEL',
    category: 'technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'AI Lab',
    startTime: '1:00 PM',
    prizePool: 20000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A fun, hands-on AI event where people learn how to use generative AI to create and interpret images.',
    image: '/images/event/tech/prompt-pixel.jpeg',
  },
  {
    id: 'mock-global-summit',
    name: 'MOCK GLOBAL SUMMIT: VENEZUELA–GREENLAND CRISIS',
    category: 'technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'Auditorium',
    startTime: '9:00 AM',
    prizePool: 20000,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'Discussing the geopolitical tensions over the world after the takeover of Venezuela.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'astrotrack',
    name: 'ASTROTRACK',
    category: 'technical',
    type: 'workshop',
    date: '2026-02-27',
    venue: 'Daimler Lab',
    startTime: '9:00 AM',
    endTime: '10:30 AM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A hands-on astrophysics workshop.',
    image: '/images/event/tech/astrotrack.jpeg',
  },
  {
    id: 'digital-detective',
    name: 'DIGITAL DETECTIVE',
    category: 'technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'CIT Lab (CS)',
    startTime: '10:00 AM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'Follow the digital breadcrumbs to solve complex cyber mysteries.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'click2cash',
    name: 'CLICK 2 CASH',
    category: 'technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'CITIL',
    startTime: '11:30 AM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'Master the art of e-commerce and digital marketing to drive revenue.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'industrial-automation',
    name: 'INDUSTRIAL AUTOMATION (MCT)',
    category: 'technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'IA Lab',
    startTime: '11:00 AM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'The future of manufacturing through robotics and PLC programming.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'aero-modelling',
    name: 'AERO MODELLING',
    category: 'technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'Drone CoE',
    startTime: '12:00 PM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'Design, build, and fly your own model aircraft.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'electrodes-to-signals',
    name: 'ELECTRODES TO SIGNALS',
    category: 'technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'ILP 3rd Floor',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'Understanding the bio-electrical signals through modern electronics.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'deadlock',
    name: 'DEADLOCK',
    category: 'technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'CSE Labs',
    prizePool: 35000,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'A head-to-head coding battle.',
    image: '/images/event/tech/deadlock.jpeg',
  },
  {
    id: 'crack-the-code',
    name: 'CRACK THE CODE',
    category: 'technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'IT Labs',
    prizePool: 25000,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'A reverse-engineering coding challenge.',
    image: '/images/event/tech/tech%20quest.jpg',
  },

  // ========== TECHNICAL EVENTS - DAY 3 (28 FEB) ==========
  {
    id: 'speedathon',
    name: 'SPEEDATHON',
    category: 'technical',
    type: 'individual',
    date: '2026-02-28',
    venue: 'Partha',
    startTime: '8:00 AM',
    endTime: '3:00 PM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A fast-paced competitive coding challenge where speed and precision are key.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'prompt-pixel',
    name: 'PROMPT PIXEL',
    category: 'technical',
    type: 'individual',
    date: '2026-02-28',
    venue: 'IT Labs',
    startTime: '1:00 PM',
    prizePool: 20000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A fun, hands-on AI event where people learn how to use generative AI to create and interpret images.',
    image: '/images/event/tech/prompt-pixel.jpeg',
  },
  {
    id: 'chain-of-lies',
    name: 'CHAIN OF LIES',
    category: 'technical',
    type: 'individual',
    date: '2026-02-28',
    venue: 'CIT Lab',
    startTime: '1:00 PM',
    prizePool: 20000,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'A high-intensity strategy and observation game.',
    image: '/images/event/tech/chain-of-lies.jpeg',
  },
  {
    id: 'building-games-web3',
    name: 'BUILDING GAMES ON WEB3',
    category: 'technical',
    type: 'workshop',
    date: '2026-02-28',
    venue: 'ILP Lab pega',
    startTime: '12:30 PM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'A hands-on workshop that walks participants through building a simple blockchain-powered game.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'escape-room',
    name: 'ESCAPE ROOM',
    category: 'technical',
    type: 'individual',
    date: '2026-02-28',
    venue: 'Pega/AI Lab',
    startTime: '10:30 AM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'Solve puzzles and unlock mysteries to find your way out before time runs out.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'soc-investigation',
    name: 'SOC INVESTIGATION',
    category: 'technical',
    type: 'individual',
    date: '2026-02-28',
    venue: 'Python Lab',
    startTime: '10:30 AM',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'Real-world security operations center simulation and incident response.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'model-mastery',
    name: 'MODEL MASTERY',
    category: 'technical',
    type: 'individual',
    date: '2026-02-28',
    venue: 'CSE Labs',
    prizePool: 25000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A high-stakes solo "vibe coding" challenge.',
    image: '/images/event/tech/final.png',
  },
  {
    id: 'the-90-minute-ceo',
    name: 'THE 90 MINUTE CEO',
    category: 'technical',
    type: 'workshop',
    date: '2026-02-28',
    venue: 'Auditorium',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A rapid-fire strategy masterclass.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'gaming-event',
    name: 'GAMING EVENT',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'Gaming Zone',
    prizePool: 25000,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'Step into intense virtual battles where strategy, reflexes, and skill decide who rules the game.',
    image: '/images/event/nontech/DESIGNERS%20ONBOARD.webp',
  },
  {
    id: 'designers-onboard',
    name: 'DESIGNERS ONBOARD',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-28',
    venue: 'Design Lab',
    prizePool: 20000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'Design lives under pressure as you transform surprise themes into striking digital visuals before time runs out.',
    image: '/images/event/nontech/DESIGNERS%20ONBOARD.webp',
  },
];

async function seedEvents() {
  console.log('🌱 Starting event seeding...\n');

  try {
    const eventsRef = db.collection('events');
    let successCount = 0;
    let errorCount = 0;

    for (const event of events) {
      try {
        console.log(`📝 Seeding: ${event.name} (${event.id})`);

        await eventsRef.doc(event.id).set({
          ...event,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        successCount++;
        console.log(`   ✅ Success\n`);
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error: ${error.message}\n`);
      }
    }

    console.log('═'.repeat(60));
    console.log(`\n🎉 Event seeding complete!`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📊 Total: ${events.length}\n`);

    // Create an index reminder
    console.log('📌 IMPORTANT: Create composite indexes in Firestore:\n');
    console.log('   1. Collection: events');
    console.log('      Fields: isActive (ASC), date (ASC), name (ASC)');
    console.log('   2. Collection: events');
    console.log('      Fields: isActive (ASC), type (ASC), date (ASC)\n');
    console.log('   Run these queries to trigger index creation:');
    console.log('   - events.where("isActive", "==", true).orderBy("date").orderBy("name")');
    console.log('   - events.where("isActive", "==", true).where("type", "==", "group")\n');

  } catch (error) {
    console.error('❌ Fatal error during seeding:', error);
    process.exit(1);
  }
}

// Run the seed script
seedEvents()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
