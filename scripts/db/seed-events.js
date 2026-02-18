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
    venue: 'Partha',
    prizePool: 35000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A high-energy group dance battle where rhythm, coordination, and stage presence come together to tell a powerful story.',
    image: '/images/event/nontech/CHOREO%20SHOWCASE.webp',
  },
  {
    id: 'rap-a-thon',
    name: 'RAP-A-THON',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-26',
    venue: 'Partha',
    prizePool: 15000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A mic, a beat, and pure fire—showcase your rap skills, flow, and crowd control in this high-voltage performance battle.',
    image: '/images/event/nontech/RAP-A-THON.webp',
  },
  {
    id: 'solo-singing',
    name: 'SOLO SINGING',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-26',
    venue: 'Partha',
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
    date: '2026-02-26',
    venue: 'Partha',
    prizePool: 15000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: "When the lyrics disappear, only memory survives. Stay on beat, think fast, and don't miss a word. One mistake could cost you the game.",
    image: '/load the lyrics.webp',
  },
  {
    id: 'frame-spot',
    name: 'FRAME SPOT',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-26',
    venue: 'Partha',
    prizePool: 10000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'Direct your model and capture a frame where style and attitude come alive.',
    image: '/images/event/nontech/REELTOREAL.jpg',
  },

  // ========== NON-TECHNICAL EVENTS - DAY 2 (27 FEB) ==========
  {
    id: 'battle-of-bands',
    name: 'BATTLE OF BANDS',
    category: 'non_technical',
    type: 'group',
    date: '2026-02-27',
    venue: 'Partha',
    prizePool: 50000,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'Inter-college bands face off in a live musical showdown to prove their originality, chemistry, and crowd-commanding sound.',
    image: '/images/event/nontech/BATTLE%20OF%20BANDS.webp',
  },
  {
    id: 'cypher',
    name: 'CYPHER',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'Partha',
    prizePool: 15000,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'A one-on-one freestyle dance battle where raw moves, attitude, and instinct decide who owns the circle.',
    image: '/images/event/nontech/CYPHER.webp',
  },
  {
    id: 'case-files',
    name: 'CASE FILES',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'CSE Seminar Hall',
    prizePool: 20000,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'Crack clues, connect evidence, and race against time in this thrilling mystery-solving challenge inspired by classic detective logic.',
    image: '/images/event/nontech/CASE%20FILES.webp',
  },

  // ========== NON-TECHNICAL EVENTS - DAY 3 (28 FEB) ==========
  {
    id: 'duo-dance',
    name: 'DUO DANCE',
    category: 'non_technical',
    type: 'group',
    date: '2026-02-28',
    venue: 'Partha',
    prizePool: 25000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'Two dancers. One vibe. Zero mercy. A power-packed performance driven by sync, chemistry, and stage dominance.',
    image: '/duo dance - final.webp',
  },
  {
    id: 'canvas-painting',
    name: 'CANVAS PAINTING',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-28',
    venue: 'Campus Grounds',
    prizePool: 15000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'Splash, blend, and layer your thoughts into a canvas that breathes color and life. Every stroke builds a mood, every shade shapes a story.',
    image: '/CanvasPainting.webp',
  },
  {
    id: 'filmfinatics',
    name: 'FILM FINATICS',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-28',
    venue: 'Media Studio',
    prizePool: 30000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'Turn a simple idea into a powerful short film using creativity, emotion, and cinematic storytelling.',
    image: '/images/event/nontech/FILMFINATICS.webp',
  },
  {
    id: 'channel-surfing',
    name: 'CHANNEL SURFING',
    category: 'non_technical',
    type: 'individual',
    date: '2026-02-28',
    venue: 'ECE Seminar Hall',
    prizePool: 10000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'Blink and you\'ll miss it—catch the clue and answer before the channel changes.',
    image: '/images/event/nontech/REELTOREAL.jpg',
  },

  // ========== TECHNICAL EVENTS - DAY 1 (26 FEB) ==========
  {
    id: 'upside-down-ctf',
    name: 'UPSIDE DOWN – THE STRANGEST CTF EVER',
    category: 'technical',
    type: 'individual',
    date: '2026-02-26',
    venue: 'Online',
    prizePool: 40000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A 5-hour immersive Capture The Flag (CTF) competition designed to challenge participants beyond traditional problem-solving with unconventional twists and layered challenges.',
    image: '/images/event/tech/upside-down-ctf.jpeg',
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
    description: 'A beginner-friendly workshop introducing MLOps (Machine Learning Operations), focusing on building intuition around how ML models are packaged, deployed, and monitored.',
    image: '/images/event/tech/tech%20quest.jpg',
  },

  // ========== TECHNICAL EVENTS - DAY 2 (27 FEB) ==========
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
    description: 'A head-to-head coding battle across five progressive levels of logic, debugging, and algorithmic challenges. Speed, accuracy, and teamwork decide who breaks the deadlock and wins.',
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
    description: 'A reverse-engineering coding challenge where participants are given only inputs, outputs, and constraints—without the problem statement. Teams must decode the hidden logic, identify the underlying problem, and write accurate code.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'mock-global-summit',
    name: 'MOCK GLOBAL SUMMIT: VENEZUELA–GREENLAND CRISIS',
    category: 'technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'Auditorium',
    prizePool: 20000,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'Discussing the geopolitical tensions over the world after the takeover of Venezuela.',
    image: '/images/event/tech/tech%20quest.jpg',
  },

  // ========== TECHNICAL EVENTS - DAY 3 (28 FEB) ==========
  {
    id: 'prompt-pixel',
    name: 'PROMPT PIXEL',
    category: 'technical',
    type: 'individual',
    date: '2026-02-28',
    venue: 'IT Labs',
    prizePool: 20000,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A fun, hands-on AI event where people learn how to use generative AI to create and interpret images. Teams work together to turn ideas and visuals into good AI prompts, fostering skills in communication and creative thinking.',
    image: '/images/event/tech/prompt-pixel.jpeg',
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
    description: 'A high-stakes solo "vibe coding" challenge where you architect a frontend website using Google\'s latest AI tools. You get exactly one attempt (20-minute limit) to craft a precise natural language prompt to command the AI to build a fully functional interface.',
    image: '/images/event/tech/final.png',
  },

  // ========== GROUP EVENTS (Multi-day or specific) ==========
  {
    id: 'treasure-hunt',
    name: 'TREASURE HUNT',
    category: 'non_technical',
    type: 'group',
    date: '2026-02-27', // Main day, but spans multiple days
    venue: 'Campus Wide',
    prizePool: 40000,
    allowedPassTypes: ['group_events', 'sana_concert'],
    isActive: true,
    description: 'Follow the clues, beat the challenges, and outsmart the unknown in an adventure packed with twists and excitement.',
    image: '/images/event/nontech/TREASURE%20HUNT.webp',
  },
  {
    id: 'foss-treasure-hunt',
    name: 'FOSS TREASURE HUNT (CAMPUS EDITION)',
    category: 'technical',
    type: 'group',
    date: '2026-02-27',
    venue: 'Campus Wide',
    prizePool: 15000,
    allowedPassTypes: ['group_events', 'sana_concert'],
    isActive: true,
    description: 'An interactive, team-based activity designed to engage students in a fun and intellectually stimulating exploration of Free and Open Source Software (FOSS) concepts. Teams navigate the campus by solving clues rooted in basic Linux commands, Git concepts, and logical puzzles.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'borderland-protocol',
    name: 'BORDERLAND PROTOCOL',
    category: 'technical',
    type: 'group',
    date: '2026-02-27',
    venue: 'Campus Grounds',
    prizePool: 50000,
    allowedPassTypes: ['group_events', 'sana_concert'],
    isActive: true,
    description: 'A card-based tech survival event inspired by Alice in Borderland, where card suits represent difficulty (Clubs, Diamonds, Hearts, Spades). Teams face multi-round challenges, and survival depends on performance, strategy, and teamwork, with poor performance leading to eliminations.',
    image: '/images/event/tech/tech%20quest.jpg',
  },

  // ========== WORKSHOPS & SPECIAL EVENTS ==========
  {
    id: 'building-games-web3',
    name: 'BUILDING GAMES ON WEB3',
    category: 'technical',
    type: 'workshop',
    date: '2026-02-27',
    venue: 'CSE Labs',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'A hands-on workshop that walks participants through building a simple blockchain-powered game from scratch using modern Web3 development tools. Participants will build a playable mini-game that interacts with the blockchain, including minting in-game NFTs.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'chain-of-lies',
    name: 'CHAIN OF LIES',
    category: 'technical',
    type: 'individual',
    date: '2026-02-27',
    venue: 'IT Labs',
    prizePool: 20000,
    allowedPassTypes: ['day_pass', 'sana_concert'],
    isActive: true,
    description: 'A high-intensity strategy and observation game built for sharp minds and fast reactions, inspired by an Among Us-style game with a blockchain twist. Validators must scan and analyze revealed crypto-data to catch the change secretly altered by the Tamperer before time runs out.',
    image: '/images/event/tech/chain-of-lies.jpeg',
  },
  {
    id: 'exchange-effect',
    name: 'EXCHANGE EFFECT',
    category: 'technical',
    type: 'group',
    date: '2026-02-28',
    venue: 'Campus Wide',
    prizePool: 30000,
    allowedPassTypes: ['group_events', 'day_pass', 'sana_concert'],
    isActive: true,
    description: 'A challenge where teams transform a single low-value "seed item" into higher-value assets by exchanging with the public. All trades must be documented via a selfie and the top 10 teams pitch their final asset for official appraisal.',
    image: '/images/event/tech/exchange-effect.jpeg',
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
    description: 'A rapid-fire strategy masterclass where students learn to validate startup ideas and pitch them without writing a single line of code. The session teaches a reverse approach: "Find the Pain, Then Sell the Cure" through modules like "Painkillers vs. Vitamins" and a "Problem Roulette" activity.',
    image: '/images/event/tech/tech%20quest.jpg',
  },
  {
    id: 'astrotrack',
    name: 'ASTROTRACK',
    category: 'technical',
    type: 'workshop',
    date: '2026-02-26',
    venue: 'Physics Lab',
    prizePool: 0,
    allowedPassTypes: ['day_pass', 'proshow', 'sana_concert'],
    isActive: true,
    description: 'A hands-on astrophysics workshop to introduce participants to the real-world science of astrometry using the professional software Astrometrica. Participants work with actual astronomical image datasets to analyze star fields and detect moving celestial objects like asteroids and Near-Earth Objects.',
    image: '/images/event/tech/astrotrack.jpeg',
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
