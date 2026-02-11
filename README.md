# CIT Takshashila 2026

**Chennai's Premier Techno-Cultural Fiesta** — Event registration website with payments, QR passes, and multi-event support.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Frontend:** React 19, Tailwind CSS 4, GSAP
- **Backend:** Firebase Auth, Firestore, Cashfree Payments
- **Email:** Resend
- **Deployment:** Vercel

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Firebase, Cashfree, and Resend credentials

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/              # Next.js App Router (pages + API routes)
├── frontend/         # UI components, contexts, hooks
├── backend/lib/      # Server libraries (firebase, email, PDF, validation)
├── public/           # Static assets (images, videos, fonts)
├── scripts/          # Utility scripts (organized by category)
│   ├── db/           # Database utilities
│   ├── users/        # User management
│   ├── testing/      # Test helpers
│   └── admin/        # Admin tasks
└── docs/             # Documentation
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run db:init` | Initialize Firestore collections |
| `npm run db:clear` | Clear database (caution!) |
| `npm run users:list` | List all users |
| `npm run test:email` | Test email sending |
| `npm run test:pdf` | Test PDF generation |

## Environment Variables

See `.env.example` for required variables:
- Firebase (client + admin)
- Cashfree (app ID + secret)
- Resend API key

## Documentation

Core docs are in the `docs/` directory:

- [System Overview](docs/SYSTEM_OVERVIEW.md)
- [Frontend Architecture](docs/FRONTEND_ARCHITECTURE.md)
- [Backend API Reference](docs/BACKEND_API_REFERENCE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Authentication & Authorization](docs/AUTHENTICATION_AUTHORIZATION.md)
- [Payment Workflow](docs/PAYMENT_WORKFLOW.md)
- [Pass & QR System](docs/PASS_QR_SYSTEM.md)
- [Email System](docs/EMAIL_SYSTEM.md)
- [Deployment & Hosting](docs/DEPLOYMENT_HOSTING.md)
- [Maintenance & Operations](docs/MAINTENANCE_OPERATIONS.md)
- [Scalability & Performance](docs/SCALABILITY_PERFORMANCE.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [Glossary](docs/GLOSSARY.md)
- [FAQ](docs/FAQ.md)

Existing supporting docs:

- [Design Language](docs/DESIGN-LANGUAGE.md)
- [Firebase Setup](docs/FIREBASE-SETUP.md)

## Key Features

- 🎫 Pass registration with QR codes
- 💳 Cashfree payment integration
- 📧 Email confirmations with PDF passes
- 👥 Group event registration
- 🔐 Firebase Authentication (Google)
- 📱 Responsive design
