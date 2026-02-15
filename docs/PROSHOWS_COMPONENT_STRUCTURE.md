# Proshows Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    CinematicHero                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Background Image (Parallax on scroll)                │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Gradient Overlay                               │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │  PROSHOWS (Syne, 9rem, fade+slide)       │  │  │  │
│  │  │  │  Tagline (Inter, fade+slide, delay 0.3s) │  │  │  │
│  │  │  │  [GET PASSES →] (Blue accent CTA)         │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              ProshowDayGroup (Day 1)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  DAY 01 (Syne, 6.5rem, scroll-trigger)               │  │
│  │  MARCH 15, 2026 (Inter, blue accent)                 │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│  │         (Animated blue gradient line)                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         CinematicProshowCard #1                       │  │
│  │  ┌──────────────┐  ┌──────────────────────────────┐  │  │
│  │  │              │  │  Artist Name (Syne, 3.75rem) │  │  │
│  │  │   Poster     │  │  Description (Inter)         │  │  │
│  │  │   Image      │  │                              │  │  │
│  │  │  (Scale 1.08 │  │  (Content lifts 4px on      │  │  │
│  │  │   on hover)  │  │   hover)                     │  │  │
│  │  │              │  │                              │  │  │
│  │  └──────────────┘  └──────────────────────────────┘  │  │
│  │  [Blue gradient border + glow on hover]              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         CinematicProshowCard #2                       │  │
│  │  (Same structure, scroll-triggered entrance)          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│  │  [Register for DAY 01 →] (Blue gradient button)      │  │
│  │  (Arrow slides right on hover)                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              ProshowDayGroup (Day 2)                        │
│  (Same structure as Day 1)                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              ProshowDayGroup (Day 3)                        │
│  (Same structure as Day 1)                                  │
└─────────────────────────────────────────────────────────────┘
```

## Animation Flow

### On Page Load
1. Hero title fades + slides up (0s)
2. Hero tagline fades + slides up (0.3s delay)
3. Hero CTA fades + slides up (0.6s delay)

### On Scroll
1. Day header enters viewport → fade + slide animation
2. Show cards enter viewport → fade + slide animation (staggered)
3. Register button enters viewport → fade + slide animation
4. Background parallax effect (continuous)

### On Hover (Desktop)
**Hero CTA:**
- Border color intensifies
- Blue glow appears
- Arrow slides right

**Show Card:**
- Card lifts 12px + scales 1.01
- Blue gradient border appears
- Image scales to 1.08
- Content lifts 4px
- Radial blue overlay fades in

**Register Button:**
- Border color intensifies
- Blue glow appears
- Arrow slides right
- Background gradient intensifies

## Color Hierarchy

```
Primary Accent: #3b82f6 (Blue)
├── Hero CTA border: rgba(59, 130, 246, 0.4)
├── Day label: rgba(59, 130, 246, 0.9)
├── Divider: rgba(59, 130, 246, 0.5)
├── Card hover border: rgba(59, 130, 246, 0.3)
├── Button glow: rgba(59, 130, 246, 0.25)
└── Background radial: rgba(59, 130, 246, 0.03)

Text Colors:
├── Primary: #FFFFFF
├── Secondary: rgba(255, 255, 255, 0.85)
└── Muted: rgba(255, 255, 255, 0.75)

Background:
└── Pure black: #000000
```

## Responsive Breakpoints

```
Desktop (≥992px)
├── Full parallax effects
├── Horizontal card layout
├── All hover interactions
└── Large typography scale

Tablet (768px - 991px)
├── Vertical card stacking
├── Reduced spacing
├── Maintained animations
└── Medium typography scale

Mobile (<768px)
├── Compact spacing
├── Smaller typography
├── Vertical layout
└── Touch-optimized
```
