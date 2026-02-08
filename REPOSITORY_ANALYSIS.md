# TKwebsite Repository Analysis

**Generated:** February 8, 2026  
**Repository:** CIT Takshashila 2026 Event Registration Platform

---

## 🎯 Executive Summary

This is a **Next.js 16 event registration and ticketing platform** for **CIT Takshashila 2026**, Chennai's premier techno-cultural festival. The application handles:

- **Event registration** with multiple pass types (Day Pass, Group Events, Proshow, All-Access)
- **Payment processing** via Cashfree payment gateway
- **QR code generation** for digital passes
- **Email delivery** with PDF pass attachments
- **Firebase authentication** (Google sign-in)
- **Firestore database** for user, payment, pass, and team management
- **Organizer dashboard** for pass scanning and attendance tracking

---

## 📊 Tech Stack

### **Core Framework**
- **Next.js 16** (App Router) - React 19
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling

### **Backend & Database**
- **Firebase Auth** - Google OAuth authentication
- **Firebase Firestore** - NoSQL database
- **Firebase Admin SDK** - Server-side operations

### **Payment & Commerce**
- **Cashfree** - Payment gateway (sandbox + production)
- **Webhook verification** - HMAC SHA-256 signature validation

### **Media & UI**
- **GSAP** - Advanced animations
- **Framer Motion** - React animations
- **Lenis** - Smooth scrolling
- **Three.js** - 3D graphics
- **Spline** - 3D design integration
- **HLS.js** - Video streaming

### **Document Generation**
- **jsPDF** - PDF generation
- **QRCode** - QR code generation
- **Canvas** - Server-side image manipulation

### **Email**
- **Resend** - Transactional email service

### **Deployment**
- **Vercel** - Production hosting
- **ngrok** - Local webhook testing

---

## 🏗️ Architecture Overview

### **Project Structure**

```
TKwebsite/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   ├── (marketing)/              # Marketing pages
│   ├── (payment)/                # Payment flow
│   ├── (registration)/           # Registration flow
│   ├── api/                      # API routes
│   │   ├── passes/               # Pass management
│   │   │   ├── [passId]/         # Get pass by ID
│   │   │   ├── scan/             # Scan & verify pass
│   │   │   └── scan-member/      # Scan team member
│   │   ├── payment/              # Payment processing
│   │   │   ├── create-order/     # Create Cashfree order
│   │   │   └── verify/           # Verify payment
│   │   ├── users/                # User management
│   │   │   ├── passes/           # User's passes
│   │   │   └── profile/          # User profile
│   │   └── webhooks/             # External webhooks
│   │       └── cashfree/         # Cashfree payment webhook
│   ├── events/                   # Events listing page
│   ├── proshows/                 # Proshows page
│   ├── sana-arena/               # Sana Arena landing
│   ├── register/                 # Registration flow
│   │   ├── my-pass/              # View user's pass
│   │   ├── pass/                 # Pass selection
│   │   ├── profile/              # User profile setup
│   │   └── success/              # Payment success
│   ├── payment/                  # Payment pages
│   │   ├── callback/             # Payment callback
│   │   └── success/              # Payment success
│   ├── login/                    # Login page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── src/                          # Source code
│   ├── components/               # React components
│   │   ├── decorative/           # Visual effects (6 items)
│   │   ├── layout/               # Layout components (3 items)
│   │   ├── sections/             # Page sections (26 items)
│   │   ├── ui/                   # UI primitives (13 items)
│   │   └── v1/                   # Legacy components
│   ├── data/                     # Static data
│   │   ├── config.ts             # App configuration
│   │   ├── events.ts             # Event listings
│   │   ├── passes.ts             # Pass definitions
│   │   ├── shows.ts              # Proshow data
│   │   └── y2k-images.ts         # Image assets
│   ├── features/                 # Feature modules
│   │   ├── auth/                 # Authentication logic
│   │   ├── email/                # Email service
│   │   ├── passes/               # Pass generation & QR
│   │   └── payments/             # Payment processing
│   ├── hooks/                    # React hooks
│   ├── lib/                      # Shared utilities
│   │   ├── constants/            # App constants
│   │   ├── db/                   # Database utilities
│   │   ├── firebase/             # Firebase config
│   │   ├── security/             # Rate limiting, etc.
│   │   └── utils/                # Helper functions
│   └── types/                    # TypeScript types
│       └── passes.ts             # Pass type definitions
│
├── public/                       # Static assets
│   ├── assets/                   # Fonts, images, audio
│   ├── images/                   # Event images, logos
│   └── videos/                   # Hero videos
│
├── scripts/                      # Utility scripts
│   ├── admin/                    # Admin tasks
│   ├── db/                       # Database utilities
│   ├── testing/                  # Test scripts
│   └── users/                    # User management
│
├── docs/                         # Documentation
│   ├── DESIGN-LANGUAGE.md        # UI/UX guidelines
│   └── PROJECT-LAYOUT-AND-ARCHITECTURE.md
│
├── styles/                       # Global styles
├── firestore.rules               # Firestore security rules
├── firebase.json                 # Firebase config
└── package.json                  # Dependencies
```

---

## 🔄 Data Flow & User Journey

### **1. User Registration Flow**

```
User visits /register
    ↓
Selects pass type (Day/Group/Proshow/All-Access)
    ↓
Signs in with Google (Firebase Auth)
    ↓
Fills registration form
    ↓
POST /api/payment/create-order
    ├─ Verifies Firebase ID token
    ├─ Validates pass type & amount
    ├─ Creates Cashfree order
    ├─ Creates payment record (status: pending)
    └─ For group events: creates team record
    ↓
Redirects to Cashfree checkout
    ↓
User completes payment
    ↓
Cashfree sends webhook to /api/webhooks/cashfree
    ├─ Verifies HMAC signature
    ├─ Updates payment status → success
    ├─ Creates pass record with QR code
    ├─ For group events: links team to pass
    ├─ Generates PDF pass
    └─ Sends email with PDF attachment
    ↓
User redirected to /register/success
    ↓
User can view pass at /register/my-pass
```

### **2. Pass Scanning Flow (Organizers)**

```
Organizer scans QR code
    ↓
POST /api/passes/scan
    ├─ Verifies organizer role
    ├─ Validates QR signature & expiry
    ├─ Checks if pass already used
    ├─ Marks pass as used (usedAt, scannedBy)
    └─ Returns pass details
```

---

## 🗄️ Database Schema (Firestore)

### **Collections**

#### **users**
```typescript
{
  uid: string;              // Firebase Auth UID
  email: string;
  name: string;
  phone?: string;
  college?: string;
  isOrganizer: boolean;     // Access control flag
  createdAt: Timestamp;
}
```

#### **payments**
```typescript
{
  userId: string;
  amount: number;
  passType: 'day_pass' | 'group_events' | 'proshow' | 'sana_concert';
  cashfreeOrderId: string;
  status: 'pending' | 'success' | 'failed';
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  teamId?: string;          // For group events
  teamMemberCount?: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

#### **passes**
```typescript
{
  userId: string;
  passType: string;
  amount: number;
  paymentId: string;        // Links to payment
  status: 'paid' | 'used';
  qrCode: string;           // Data URL
  teamId?: string;          // For group events
  teamSnapshot?: {          // Denormalized team data
    teamName: string;
    totalMembers: number;
    members: Array<{
      memberId: string;
      name: string;
      phone: string;
      isLeader: boolean;
      checkedIn: boolean;
    }>;
  };
  usedAt?: Timestamp;
  scannedBy?: string;       // Organizer UID
  createdAt: Timestamp;
}
```

#### **teams**
```typescript
{
  teamId: string;
  teamName: string;
  leaderId: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  leaderCollege: string;
  members: Array<{
    memberId: string;
    name: string;
    phone: string;
    email: string;
    isLeader: boolean;
    attendance: {
      checkedIn: boolean;
      checkInTime?: Timestamp;
      checkedInBy?: string;
    };
  }>;
  totalMembers: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  orderId: string;
  passId?: string;
  paymentStatus: 'pending' | 'success';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### **registrations** (Legacy)
```typescript
// Note: This collection appears to be legacy
// Current implementation uses 'payments' instead
```

---

## 🎫 Pass Types

| Pass Type | ID | Price | Description |
|-----------|----|----|-------------|
| **Day Pass** | `day_pass` | ₹500 | Single day access to events |
| **Group Events** | `group_events` | ₹250/person | Team-based event registration |
| **Proshow Pass** | `proshow` | ₹1000 | Day 1 + Day 3 Proshows |
| **All-Access** | `sana_concert` | ₹1500 | All 3 days + Sana Concert |

---

## 🎨 Events

### **Non-Technical Events (12)**
- Choreo Showcase
- Battle of Bands
- Cypher
- Rap-a-thon
- Dual Dance
- Solo Singing
- Paint the Town
- Gaming Event
- Case Files
- Treasure Hunt
- Film Finatics
- Designers Onboard

### **Technical Events (13)**
- Deadlock (Coding Battle)
- Crack the Code
- FOSS Treasure Hunt
- MLOps Workshop
- Prompt Pixel (AI)
- Building Games on Web3
- Chain of Lies (Blockchain)
- Model Mastery (AI Frontend)
- Borderland Protocol
- Mock Global Summit
- Exchange Effect
- The 90 Minute CEO
- Astrotrack (Astrophysics)
- Upside Down CTF

---

## 🔐 Security Features

### **Authentication**
- Firebase Auth with Google OAuth
- ID token verification on all protected API routes
- Role-based access control (organizer flag)

### **Payment Security**
- Cashfree webhook signature verification (HMAC SHA-256)
- Server-side amount validation
- Idempotency checks (prevent duplicate passes)

### **Rate Limiting**
- `/api/payment/create-order`: 5 requests/minute
- `/api/passes/scan`: 10 requests/minute

### **Firestore Rules**
- Users can only read/write their own data
- Passes/payments: read-only for owners
- All writes via Admin SDK only
- Organizers can read all passes/teams

### **QR Code Security**
- Signed tokens with expiry
- Server-side signature verification
- One-time use enforcement

---

## 📧 Email System

**Provider:** Resend

**Templates:**
- **Pass Confirmation** - Sent after successful payment
  - Includes PDF pass attachment
  - QR code embedded
  - Event details

**Attachments:**
- PDF pass generated server-side
- Includes user details, QR code, team members (for group events)

---

## 🎨 Design System

### **Color Palette**
- **Background:** Black (`#000`)
- **Text:** White (`#fff`), with opacity variants
- **Accents:** Gold tint for special elements
- **Surfaces:** `rgba(255,255,255,0.06)` to `0.1`

### **Typography**
- **Primary Font:** Inter Display
- **Weights:** 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Scale:** Fluid sizing with `clamp()`

### **Layout**
- **Grid:** 12-column responsive grid
- **Container:** Max-width 90rem
- **Spacing:** Fluid with CSS custom properties

### **Motion**
- **Smooth Scroll:** Lenis
- **Animations:** GSAP, Framer Motion
- **Easing:** `cubic-bezier(0.625, 0.05, 0, 1)`

### **Breakpoints**
- Small mobile: < 480px
- Mobile: 480-767px
- Tablet: 768-991px
- Desktop: 992px+

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run start            # Production server
npm run lint             # Run ESLint

# Database
npm run db:init          # Initialize Firestore collections
npm run db:clear         # Clear database (CAUTION!)
npm run db:debug         # Debug collections

# User Management
npm run users:list       # List all users
npm run users:find       # Find specific user
npm run users:dump       # Export user data

# Testing
npm run test:email       # Test email sending
npm run test:pdf         # Test PDF generation
npm run test:payment     # Simulate payment flow
```

---

## 🔧 Environment Variables

### **Required**

```bash
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server)
FIREBASE_SERVICE_ACCOUNT_KEY=  # JSON as single line

# Cashfree
NEXT_PUBLIC_CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
NEXT_PUBLIC_CASHFREE_ENV=      # sandbox | production

# Email
RESEND_API_KEY=

# QR Signing
QR_SIGNING_SECRET=             # For QR code signature
```

---

## 🚀 Deployment

### **Platform:** Vercel

### **Configuration:**
- Auto-deploys from main branch
- Environment variables configured in Vercel dashboard
- `.vercelignore` excludes unnecessary files

### **Webhook Setup:**
- Cashfree webhook URL: `https://yourdomain.com/api/webhooks/cashfree`
- Must be HTTPS in production
- Use ngrok for local testing

---

## 📝 Key Files Reference

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with AuthProvider |
| `app/page.tsx` | Home page with all sections |
| `app/api/payment/create-order/route.ts` | Create Cashfree order |
| `app/api/webhooks/cashfree/route.ts` | Handle payment webhooks |
| `app/api/passes/scan/route.ts` | Scan & verify passes |
| `src/features/passes/qrService.ts` | QR generation & verification |
| `src/features/passes/pdfGenerator.server.ts` | Server-side PDF generation |
| `src/features/email/emailService.ts` | Email templates & sending |
| `src/types/passes.ts` | Pass type definitions |
| `src/data/passes.ts` | Pass configuration |
| `src/data/events.ts` | Event listings |
| `firestore.rules` | Firestore security rules |

---

## 🐛 Known Issues & Considerations

### **From Conversation History:**

1. **Payment Status Sync** (Resolved)
   - Issue: Payments showing as pending when successful
   - Cause: Webhook not triggering in local dev
   - Solution: Use ngrok for local webhook testing

2. **PDF Text Overlap** (Resolved)
   - Issue: Team member lists causing text overlap
   - Solution: Implemented pagination for large teams

3. **Mobile Payment Flow** (Resolved)
   - Issue: Payments not recording on mobile
   - Solution: Fixed API request handling

4. **Port Conflicts** (Resolved)
   - Issue: Port 3000 already in use
   - Solution: Kill existing processes or use different port

5. **Project Refactoring** (Completed)
   - Migrated to feature-based architecture
   - Updated import paths
   - Improved code organization

---

## 🎯 Current File You're Viewing

**File:** `/Users/shreeshanthr/TKwebsite/app/api/passes/scan/route.ts`

**Purpose:** Organizer-only endpoint to scan and verify passes

**Key Features:**
- Rate limited (10 requests/minute)
- Requires organizer role
- Verifies QR signature & expiry
- Prevents duplicate scans
- Records scan metadata (timestamp, organizer)

---

## 📚 Documentation Files

1. **PROJECT-LAYOUT-AND-ARCHITECTURE.md** - Detailed architecture guide
2. **DESIGN-LANGUAGE.md** - UI/UX design system
3. **FIREBASE-SETUP.md** - Firebase configuration guide
4. **GLOWING_DOTS_GRID.md** - Specific component documentation

---

## 🔄 Recent Changes (from conversation history)

1. **Registration UI Redesign** (Feb 8, 2026)
   - Updated pass cards with SciFiCard component
   - Custom font integration
   - Group registration modal theming

2. **Home Page Parallax Fix** (Feb 7, 2026)
   - Fixed broken parallax effects
   - Resolved visual conflicts

3. **SciFi Card Refactoring** (Feb 7, 2026)
   - Fixed SVG ID conflicts
   - Removed dead code from FabricGridBackground

4. **Payment & PDF Fixes** (Feb 6, 2026)
   - Fixed payment recording issues
   - Implemented PDF pagination
   - Resolved webhook connectivity

5. **Project Refactoring** (Feb 5, 2026)
   - Migrated to enterprise-grade structure
   - Feature-based architecture
   - Updated all import paths

---

## 💡 Development Tips

1. **Local Development:**
   - Use ngrok for webhook testing: `ngrok http 3000`
   - Update Cashfree webhook URL to ngrok URL
   - Use sandbox mode for Cashfree

2. **Database:**
   - Use Firebase Emulator for local testing
   - Run `npm run db:debug` to inspect collections
   - Be careful with `db:clear` - it's destructive!

3. **Testing:**
   - Use `npm run test:payment` to simulate payment flow
   - Test email templates with `npm run test:email`
   - Test PDF generation with `npm run test:pdf`

4. **Debugging:**
   - Check Vercel logs for production issues
   - Use Firebase Console for database inspection
   - Check Cashfree dashboard for payment status

---

## 🎓 Learning Resources

- **Next.js 16 Docs:** https://nextjs.org/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Cashfree API:** https://docs.cashfree.com/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **GSAP:** https://greensock.com/docs/

---

**End of Analysis**

This repository is a production-ready event registration platform with robust payment processing, security features, and a modern tech stack. The codebase is well-organized with clear separation of concerns and comprehensive documentation.
