# Design Language — Zeit Media Clone (CIT Takshashila)

This document describes the current design language of the website: colors, typography, spacing, layout, components, motion, and responsive behavior. Use it to keep new work consistent with the existing system.

---

## 1. Overview

- **Theme:** Dark, editorial, media-agency style (inspired by Zeit Media).
- **Background:** Black (`#000`) everywhere; sections use the same dark background for a continuous feel.
- **Foreground:** White and light gray for text and UI; high contrast, minimal palette.
- **Motion:** Smooth, eased transitions; Lenis smooth scroll; nav hides on scroll-down, reappears on scroll-up.
- **Layout:** 12-column grid, fluid spacing with `clamp()`, max-width container (~90rem).

---

## 2. Color Palette

| Token | Value | Usage |
|-------|--------|--------|
| `--swatch--dark-900` | `black` | Page background, dark surfaces |
| `--swatch--light-100` | `white` | Primary text, nav, buttons, accents |
| `--_theme---background` | `var(--swatch--dark-900)` | Section backgrounds (service cards, CTA, footer) |

**Semantic / one-off usage:**

- **Text:** `#fff` (primary), `rgba(255, 255, 255, 0.5)` (muted), `rgba(255, 255, 255, 0.6)` (eyebrow/subtext).
- **Borders / dividers:** `rgba(255, 255, 255, 0.15)` (e.g. sticky card top border).
- **Surfaces:** `rgba(255, 255, 255, 0.06)` (about card), `rgba(255, 255, 255, 0.1)` (work card hover, button hover).
- **Accent (about quote):** `rgba(212, 175, 55, 0.08)` (gold tint).
- **Overlays:** `rgba(0, 0, 0, 0.8)` (lightbox).
- **Button hover:** White background; text flips to `#000`.

---

## 3. Typography

### Font family

- **Primary:** `Interdisplay` (local: “Inter Display” / “Inter”), fallback `Arial, sans-serif`.
- **CSS variable:** `--_typography---font--primary-family: Interdisplay, Arial, sans-serif`.

### Font weights

| Token | Value | Use |
|-------|--------|-----|
| `--_typography---font--primary-regular` | `400` | Body |
| `--_typography---font--primary-medium` | `500` | Nav, labels, captions |
| `--_typography---font--primary-semibold` | `600` | Buttons, headings, CTA text |
| `--_typography---font--primary-bold` | `700` | Strong emphasis, client names |
| Light (300) | — | Nav subtext (optional) |

### Type scale (representative)

- **Nav link:** ~`0.875rem`, medium.
- **Nav subtext:** `0.625rem`, light, opacity 0.6.
- **Bubble button:** `0.875rem` (desktop), `0.75rem` (small screens); uppercase, letter-spacing `0.05em`.
- **Body / rich text:** `clamp(1rem, 1.25vw, 1.25rem)`, line-height ~1.6.
- **Section headings (e.g. H3):** `clamp(1.875rem, 1.46rem + 2.08vw, 3rem)`, semibold.
- **About heading:** `clamp(2.5rem, 5vw, 4rem)`, bold, letter-spacing `-0.03em`.
- **About subheading:** `0.875rem`, uppercase, letter-spacing `0.2em`.
- **CTA / 3D heading:** `clamp(3rem, 10vw, 8rem)` or `10cqw` (container query), uppercase, letter-spacing `-0.02em`.
- **Marquee text:** `10rem` (desktop), scales down on tablet/mobile (`8rem`, `6rem`, `4rem`).
- **Featured clients / work titles:** Large style, bold; sizes use `clamp()` for fluid scaling.
- **Footer:** ~`0.875rem` (links), `0.75rem` (labels); muted white for secondary.

Line-heights: headings ~1.1–1.3, body ~1.6–1.8.

---

## 4. Spacing System

Spacing is fluid: values scale between viewport 20rem and 90rem via `clamp()`.

### Container & gutter

- **Viewport:** `--site--viewport-min: 20`, `--site--viewport-max: 90`.
- **Gutter:** `--site--gutter` — `clamp(1.5rem, …, 2.25rem)`.
- **Max content width:** `--max-width--main: 90rem`.

### Spacing scale

| Token | Approx. range | Use |
|-------|----------------|-----|
| `--_spacing---space--3` | ~0.875rem–1rem | Tight gaps |
| `--_spacing---space--4` | ~1.25rem–1.5rem | Small gaps |
| `--_spacing---space--5` | ~1.75rem–2rem | Medium |
| `--_spacing---space--6` | ~2rem–2.5rem | |
| `--_spacing---space--7` | ~2.25rem–3rem | |
| `--_spacing---section-space--small` | ~3rem–5rem | Between small sections |
| `--_spacing---section-space--main` | ~5rem–7rem | Default section spacing |
| `--_spacing---section-space--large` | ~5.5rem–10rem | Large section spacing |

Section spacers use utility classes (e.g. `u-section-spacer` with variant UUIDs) to apply these heights.

---

## 5. Layout & Grid

### Container

- **Class:** `.u-container`
- **Max-width:** `var(--max-width--main)` (90rem).
- **Horizontal padding:** `var(--site--margin, 1rem)` or `var(--site--gutter)` depending on section.
- **Centering:** `margin-left: auto; margin-right: auto`.

### Grid

- **Class:** `.u-grid-custom`
- **Definition:** `grid-template-columns: repeat(12, 1fr)`; `gap: var(--site--gutter)`.
- **Column utilities:** `.u-column-1` … `.u-column-12` (span 1–12).
- **Typical usage:** Nav 12 columns; services: number (1) + heading (4) + image (6); works: 6+6 or 3+3+3+3; footer columns as needed.

### Sticky / full-viewport

- **Sticky cards:** `.sticky-card-wrap` (sticky, top 0), `.sticky-card` (full height, dark bg, top border).
- **CTA section:** `min-height: 100dvh`, centered content; 3D canvas + heading overlay.
- **Hero:** Full viewport; video background + centered logo overlay.

---

## 6. Components

### Navigation

- **Position:** Fixed top, full width; `mix-blend-mode: difference` so it inverts over dark/light content.
- **Color:** White (`#fff`).
- **Behavior:** On scroll down, main links move up (`translateY(-300%)`); on scroll up, they return. Menu toggle and bubble button appear when scrolled.
- **Logo:** SVG, max-width ~165px (desktop), 120px (tablet), 100px (small mobile).
- **Links:** Flex, gap ~4rem (desktop); each link has main text + small subtext (0.625rem, opacity 0.6).
- **Menu:** Full-screen overlay; links large (e.g. `clamp(2.5rem, 7.5cqw, 5rem)`), uppercase; opacity 0.2 default, 1 on hover/current; arrow icon scales in on hover.

### Buttons

- **Bubble arrow (`.btn-bubble-arrow`):** Text + arrow; uppercase, small type; arrow duplicates on hover with slide-in.
- **Primary / “View case” (`.button_main_wrap`):** White text; on hover, white background slides up from bottom (`translateY(101%)` → `0`) and text turns black. Same idea for `.cs_btn_wrap` on work cards.
- **Easing:** `cubic-bezier(0.625, 0.05, 0, 1)` for slide/color, ~0.35s.

### Cards

- **Work items (`.work_item`):** Image (aspect 756/430) scales to 1.05 on hover; info area gets `rgba(255,255,255,0.1)` background; “View case” button reveals white bg + black text.
- **Service cards:** Number + heading + body + optional quote; image 698/393, border-radius `0.75rem`.
- **Sticky cards:** Dark bg, top border, large vertical padding (e.g. 6rem 8rem).
- **About card:** Subtle light bg `rgba(255,255,255,0.06)`; quote area with gold tint.

### Marquee

- **Track:** Full width, overflow hidden; optional rotation ±4°.
- **Content:** Large “Interdisplay” type (e.g. 10rem), white; images in pill-shaped wrappers (border-radius 999px, aspect 2).
- **Animation:** 30s linear infinite, translateX for left/right.

### Footer

- **Background:** Same as theme (`--_theme---background`).
- **Text:** White; links 0.875rem; labels 0.75rem, uppercase; muted `rgba(255,255,255,0.5)` for secondary.
- **Featured project:** Image aspect 424/240; hover scale 1.05.

### Eyebrow

- **Marker:** Small white circle (0.5rem), pulse animation.
- **Text:** Optional, opacity 0.6; used above headings.

### Events page

- **Hero (`.events-hero`):** Full viewport (`min-height: 100dvh`), black bg, centered; eyebrow "EVENTS"; H1 `clamp(3rem, 10vw, 8rem)` uppercase; subtext 0.875rem, opacity 0.6, letter-spacing 0.2em.
- **Category switch (`.events-category-switch`):** Sticky bar below hero; two editorial tabs "NON-TECHNICAL EVENTS" / "TECHNICAL EVENTS"; active opacity 1, inactive 0.3; bottom border `rgba(255,255,255,0.15)`.
- **Event card (`.event-card`):** Flex column; `.event-card__image` (aspect 756/430, overflow hidden only on image); `.event-content` with gap + padding, `.event-cta` with `margin-top: auto` so REGISTER is always visible at bottom; no overflow clip on card/content; hover affects image scale (desktop) and button bg slide only, not visibility.
- **Events grid (`.events-grid`):** 3 cols desktop, 2 tablet, 1 mobile; gap `var(--site--gutter)`; card reveal on scroll (GSAP).
- **Sticky Register CTA (`.events-sticky-cta`):** Fixed bottom bar "Register Now" on mobile only (max-width 767px).

### Registration page

- **Hero (`.registration-hero`):** Full viewport (`min-height: 100dvh`), black bg, centered; eyebrow "REGISTRATION"; H1 "CHOOSE YOUR PASS" `clamp(3rem, 10vw, 8rem)` uppercase; subtext "Access events • Proshows • Concerts"; subtle fade/slide entrance on load.
- **Urgency (`.registration-urgency`):** "Limited Slots Available" micro-text (opacity 0.5); minimal countdown (DD : HH : MM : SS), white text only; target date in `lib/registrationConfig.ts`.
- **Passes grid (`.registration-passes-grid`):** 4 cols desktop, 2×2 tablet, 1 col mobile; gap `var(--site--gutter)`; section spacing `--_spacing---section-space--large`.
- **Pass card (`.pass-card`):** Dark surface `rgba(255,255,255,0.06)`, thin top border `rgba(255,255,255,0.15)`, generous vertical padding; hover (desktop) lift `translateY(-6px)`, background `rgba(255,255,255,0.1)`; REGISTER button uses same white slide-up + black text as primary buttons.
- **Sticky CTA (`.registration-sticky-cta`):** Mobile only (max-width 767px); "READY TO REGISTER?" + "CHOOSE YOUR PASS" button opens pass selector modal.
- **Pass selector modal (`.pass-selector-modal`):** Lists 4 passes; selecting one scrolls to that card and closes modal; overlay `rgba(0,0,0,0.8)`; panel black with border.

---

## 7. Motion & Animation

- **Easing:** `cubic-bezier(0.625, 0.05, 0, 1)` for nav, buttons, work card hovers (~0.35s–0.735s).
- **Scroll:** Lenis smooth scroll; scrollbar hidden site-wide.
- **Nav:** 0.5s ease for link bar hide/show; 0.5s cubic-bezier for toggle/button reveal.
- **Pulse:** Eyebrow dot uses 2s ease-in-out infinite pulse (opacity + scale).
- **Marquee:** 30s linear infinite.
- **Hover:** Image scale 1.05–1.08; button bg slide; menu link opacity and arrow scale.

---

## 8. Breakpoints (Responsive)

| Name | Min width | Max width | Notes |
|------|-----------|-----------|--------|
| Small mobile | — | 479px | Single column, smallest type, compact nav |
| Mobile landscape | 480px | 767px | Often same as “mobile” in code |
| Tablet | 768px | 991px | 2-column work grid; some sections stack |
| Desktop | 992px | — | Full 12-col, nav links visible, sticky layouts |
| Laptop | 992px | 1199px | Optional tweaks |
| Large | 1200px | — | More spacing/type scale |
| XL | 1400px | — | Max widths, hero/CTA refinements |

**Special:** `max-height: 500px` and `orientation: landscape` for short viewports; `(hover: none) and (pointer: coarse)` for touch.

---

## 9. CSS Variables Quick Reference

```css
/* Layout */
--site--viewport-min: 20;
--site--viewport-max: 90;
--site--gutter: clamp(1.5rem, …, 2.25rem);
--max-width--main: 90rem;

/* Colors */
--swatch--light-100: white;
--swatch--dark-900: black;
--_theme---background: var(--swatch--dark-900);

/* Typography */
--_typography---font--primary-family: Interdisplay, Arial, sans-serif;
--_typography---font--primary-regular: 400;
--_typography---font--primary-medium: 500;
--_typography---font--primary-bold: 700;

/* Spacing (fluid) */
--_spacing---space--3 … --_spacing---space--7;
--_spacing---section-space--small;
--_spacing---section-space--main;
--_spacing---section-space--large;
```

---

## 10. File Map

- **`app/globals.css`** — Main design system: variables, nav, grid, buttons, cards, works, CTA, footer, events page, registration page, responsive.
- **`app/webflow.css`** — Normalize/reset and base HTML element styles.
- **`app/events/page.tsx`** — Events page: hero, category switch, events grid, sticky CTA.
- **`app/register/page.tsx`** — Registration page: hero, urgency, passes grid, sticky CTA, pass selector modal.
- **`components/EventsHero.tsx`**, **`EventCategorySwitch.tsx`**, **`EventCard.tsx`**, **`EventsGrid.tsx`**, **`StickyRegisterCTA.tsx`** — Events page sections.
- **`components/RegistrationHero.tsx`**, **`RegistrationUrgency.tsx`**, **`PassCard.tsx`**, **`RegistrationPassesGrid.tsx`**, **`RegistrationStickyCTA.tsx`**, **`PassSelectorModal.tsx`** — Registration page sections.
- **`lib/eventsData.ts`** — Non-technical and technical event data (name, description, image).
- **`lib/registrationPassesData.ts`** — Pass options (Day, Group Events, Proshow, All-Access).
- **`lib/registrationConfig.ts`** — Countdown target date for registration page.
- **`app/marquee-globals.css`** — Marquee layout, typography, scaling video block, marquee keyframes.

Use this document when adding or changing UI so new elements stay consistent with the current design language.
