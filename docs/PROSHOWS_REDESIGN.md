# Proshows Page Premium Redesign

## Overview
The Proshows page has been completely redesigned with a premium, cinematic aesthetic featuring blue accent colors (#3b82f6), GSAP animations, and modern UI interactions.

## Key Changes

### 1. **Typography**
- **Headings**: Syne (primary) / Space Grotesk (fallback) - Bold, editorial, expressive
- **Body**: Inter (primary) / DM Sans (fallback) - Clean, modern, readable
- Dramatic scale hierarchy with large titles (up to 9rem on hero)
- Tight letter-spacing for impact

### 2. **Color Palette**
- **Background**: Pure black (#000000)
- **Primary text**: White (#FFFFFF)
- **Secondary text**: rgba(255, 255, 255, 0.85)
- **Accent**: Blue #3b82f6 (rgb(59, 130, 246)) - matches Events page
  - Used on borders, hover states, gradients, day labels
  - Subtle glows and shadows for depth

### 3. **Hero Section** (`CinematicHero.tsx`)
**GSAP Animations:**
- Title: Fade + slide up (60px, 1.2s)
- Tagline: Fade + slide up (40px, 1s, 0.3s delay)
- CTA: Fade + slide up (30px, 0.8s, 0.6s delay)
- Parallax scroll effect on background (0.5x speed)

**Visual Design:**
- Full viewport height with layered background
- Gradient overlay for readability
- Blue accent CTA button with gradient background
- Arrow icon with slide animation on hover

### 4. **Day Group Sections** (`ProshowDayGroup.tsx`)
**GSAP Animations:**
- Header: Scroll-triggered fade + slide (40px)
- Register button: Scroll-triggered fade + slide (30px)
- Arrow icon: Translates 4px right on hover

**Visual Design:**
- Large day titles (up to 6.5rem)
- Blue accent date labels
- Animated gradient divider lines (blue accent)
- Premium register button with blue gradient border

### 5. **Show Cards** (`CinematicProshowCard.tsx`)
**GSAP Animations:**
- Card entrance: Scroll-triggered fade + slide (60px, 1s)
- Image hover: Scale to 1.08 (0.6s)
- Content hover: Translate up 4px (0.4s)

**Visual Design:**
- Horizontal layout (image left, content right)
- Layered borders with blue gradient accent
- Soft shadows with blue glow on hover
- Image container with subtle vignette
- Premium card elevation on hover (12px lift + scale 1.01)
- Radial blue gradient overlay on hover

### 6. **Responsive Behavior**
**Desktop (992px+):**
- Full parallax and hover effects
- Horizontal card layout
- Large typography scale

**Tablet (768px - 991px):**
- Vertical card stacking
- Reduced spacing
- Maintained animations

**Mobile (<768px):**
- Compact spacing
- Smaller typography
- Vertical layout
- Touch-optimized interactions

## Files Modified

1. **`src/components/sections/proshows/CinematicHero.tsx`**
   - Added GSAP entrance animations
   - Added parallax scroll effect
   - Enhanced CTA with arrow icon

2. **`src/components/sections/proshows/CinematicProshowCard.tsx`**
   - Added scroll-triggered entrance animations
   - Added hover interactions (image scale, content lift)
   - Registered ScrollTrigger plugin

3. **`src/components/sections/proshows/ProshowDayGroup.tsx`**
   - Added scroll-triggered animations for header and button
   - Added arrow hover animation
   - Registered ScrollTrigger plugin

4. **`styles/proshows-premium.css`** (NEW)
   - Complete premium styling system
   - Blue accent color throughout
   - Layered borders and gradients
   - Responsive breakpoints
   - Hover states and transitions

5. **`styles/globals.css`**
   - Added import for `proshows-premium.css`

6. **`app/layout.tsx`**
   - Added Syne and Inter fonts from Google Fonts
   - Added font CSS variables to HTML element

## Design Principles Applied

✅ **Cinematic & Editorial** - Large typography, dramatic spacing, layered depth
✅ **Premium Feel** - Subtle gradients, soft shadows, blue accent glows
✅ **Fluid Motion** - GSAP animations with smooth easing curves
✅ **Blue Accent Consistency** - Matches Events page color (#3b82f6)
✅ **Responsive Excellence** - Optimized for all screen sizes
✅ **Accessibility** - Proper contrast ratios, focus states
✅ **Performance** - Optimized animations, will-change hints

## Animation Timing

- **Entrance animations**: 0.8s - 1.2s with power3.out easing
- **Hover interactions**: 0.4s - 0.7s with power2.out easing
- **Scroll triggers**: Start at 85-90% viewport
- **Parallax**: 0.5x scroll speed for subtle depth

## Color Usage

| Element | Color | Usage |
|---------|-------|-------|
| Hero CTA border | rgba(59, 130, 246, 0.4) | Primary accent |
| Day label text | rgba(59, 130, 246, 0.9) | Highlight |
| Divider gradient | rgba(59, 130, 246, 0.5) | Separator |
| Card border hover | rgba(59, 130, 246, 0.3) | Interaction |
| Button glow | rgba(59, 130, 246, 0.25) | Depth |
| Background radial | rgba(59, 130, 246, 0.03) | Subtle ambiance |

## Browser Support

- Modern browsers with GSAP 3.14.2
- CSS Grid and Flexbox
- CSS custom properties
- Backdrop filters (graceful degradation)

## Performance Considerations

- GSAP context cleanup on unmount
- Passive scroll listeners
- CSS containment where applicable
- Optimized image loading
- Minimal repaints with transform/opacity animations
