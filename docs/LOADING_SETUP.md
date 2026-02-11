# Loading Animation Setup

## Overview
The website now features a premium loading animation that plays when users first visit the site. The animation uses the Takshashila logo with a cinematic flip and shrink-out effect.

## Implementation Details

### Components Created

1. **LoadingScreen Component** (`src/components/ui/LoadingScreen.tsx`)
   - Animated loading screen with logo flip animation
   - Features: Logo → Logo Hold → Flip → TKX Hold → Shrink Out
   - Duration: ~5-6 seconds
   - Mobile-responsive design
   - Gold particle effects for visual enhancement

2. **LoadingContext** (`src/contexts/LoadingContext.tsx`)
   - Manages global loading state
   - Uses `sessionStorage` to show loading only once per session
   - Provides `useLoading` hook for components

3. **ClientLayout** (`src/components/layout/ClientLayout.tsx`)
   - Wraps the app with loading functionality
   - Handles loading completion callback
   - Smooth fade-in transition after loading

### Assets

- **tk-logo-animated.svg** - Animated Takshashila logo (in `/public`)
- **test-x.svg** - Golden "X" graphic for the flip animation (in `/public`)

### Integration

The loading screen is integrated at the root level in `app/layout.tsx`:

```tsx
<ClientLayout>
  <AuthProvider>{children}</AuthProvider>
</ClientLayout>
```

## Features

✅ **Session-based loading** - Shows only once per browser session
✅ **Mobile responsive** - Optimized for all screen sizes
✅ **Smooth animations** - Framer Motion powered transitions
✅ **Gold particle effects** - Enhances visual appeal
✅ **Automatic fade-out** - Seamless transition to main content
✅ **No layout shift** - Prevents content jumping

## Animation Timeline

1. **0-2.5s**: Logo enters and holds
2. **2.5-3s**: Logo hold phase
3. **3-4s**: Logo flips out, TKX flips in
4. **4-5s**: TKX hold phase
5. **5-5.5s**: Shrink out with golden box
6. **5.5-6s**: Fade out and complete

## Customization

### Change Animation Duration

Edit the timeouts in `LoadingScreen.tsx`:

```tsx
const logoHoldTimer = setTimeout(() => setStage("logo-hold"), 2500);
const flipTimer = setTimeout(() => setStage("flip"), 3000);
const holdTimer = setTimeout(() => setStage("hold"), 4000);
const shrinkTimer = setTimeout(() => setStage("shrink-out"), 5000);
```

### Disable Session Storage

To show loading on every page load, modify `LoadingContext.tsx`:

```tsx
// Comment out or remove this check
const hasSeenLoading = sessionStorage.getItem('hasSeenLoading');
```

### Change Colors

Edit the gold gradient colors in `test-x.svg` or the particle colors in `LoadingScreen.tsx`:

```tsx
background: i % 3 === 0 ? "#8B6914" : i % 3 === 1 ? "#6B4F0A" : "#4a3000"
```

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lightweight: ~11KB component + 37KB SVG
- GPU-accelerated animations
- No impact on page load metrics after first render
- Lazy-loaded with code splitting
