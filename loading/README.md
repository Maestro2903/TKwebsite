# Loading Screen Components

This folder contains the loading screen components and assets for the Takshashila 2026 website.

## Files Included

### Components

1. **LoadingScreen.tsx**
   - Main loading screen component with zoom-through animation
   - Features a logo flip animation followed by a cinematic zoom effect
   - Timeline: Logo → Logo Hold → Flip → TKX Hold → Zoom Through
   - Duration: ~8.8 seconds

2. **LoadingRemastered.tsx**
   - Alternative loading screen with shrink-out animation
   - Mobile-responsive design
   - Features logo flip followed by a shrink effect with a golden box
   - Timeline: Logo → Logo Hold → Flip → TKX Hold → Shrink Out
   - Duration: ~5-6 seconds
   - Includes callback support via `onFinished` prop

### Assets

1. **tk-logo-animated.svg**
   - Animated Takshashila logo used in the initial loading phase

2. **test-x.svg**
   - The "X" graphic used in the LoadingRemastered component

## Dependencies

Both components require:
- `react` and `react-dom`
- `framer-motion` for animations
- `next.js` (uses "use client" directive)

## Usage

### LoadingScreen
```tsx
import HybridXLoader from './LoadingScreen';

function App() {
  return <HybridXLoader />;
}
```

### LoadingRemastered
```tsx
import LoadingRemastered from './LoadingRemastered';

function App() {
  return (
    <LoadingRemastered 
      onFinished={() => console.log('Loading complete!')} 
    />
  );
}
```

## Animation Details

### LoadingScreen (Zoom Through)
- Logo enters and holds
- Logo flips out, TKX flips in
- TKX holds briefly
- TKX zooms toward camera with motion blur
- Background fades before zoom completes for seamless transition

### LoadingRemastered (Shrink Out)
- Logo enters and holds
- Logo flips out, TKX flips in
- TKX holds
- TKX shrinks vertically with a golden box appearing
- Smooth fade out

## Notes

- Both components use `z-[9999]` to ensure they appear above all other content
- Particle effects included for visual enhancement
- Mobile-responsive (LoadingRemastered has specific mobile optimizations)
- Gold color palette: `#8B6914`, `#6B4F0A`, `#4a3000`
