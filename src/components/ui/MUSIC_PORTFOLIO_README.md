# Music Portfolio Component

This component uses the exact design from [21st.dev/r/lovesickfromthe6ix/music-portfolio](https://21st.dev/r/lovesickfromthe6ix/music-portfolio).

## Features

- **GSAP ScrambleText Animation** - Text scrambles on hover with "hacker" style characters
- **Idle Animation** - When inactive, items fade in/out in sequence
- **Background Image Hover** - Full-screen album cover appears behind list on hover
- **Time Display** - Live clock in bottom-right corner with blinking colon
- **Corner UI** - Decorative elements and navigation in all four corners
- **Responsive Grid** - List adapts from 5 columns to 2 columns on mobile

## ScrambleTextPlugin Requirement

⚠️ **IMPORTANT**: This component uses GSAP's `ScrambleTextPlugin`, which is a **premium plugin** that requires a [Club GreenSock membership](https://greensock.com/club/).

### If you have Club GreenSock access:

1. Install the plugin from your private npm registry:
   ```bash
   npm install gsap@npm:@gsap/shockingly
   ```

2. The plugin is already registered in the component - no additional setup needed.

### If you DON'T have Club GreenSock access:

The component will throw an error when trying to use `ScrambleTextPlugin`. You have two options:

**Option 1: Purchase Club GreenSock** ($99/year for individuals)
- Go to https://greensock.com/club/
- Sign up and get access to all premium plugins

**Option 2: Replace the scramble effect** with a free alternative:
- Comment out the ScrambleTextPlugin import and registration
- Replace the `scrambleText` animation in `ProjectItem` with a simple fade:

```typescript
// Instead of:
gsap.to(ref.current, {
  duration: 0.8,
  scrambleText: { ... }
});

// Use:
gsap.fromTo(ref.current, 
  { opacity: 0 }, 
  { opacity: 1, duration: 0.4 }
);
```

## Usage

The component is already integrated into the Sana Arena page with Santhosh Narayanan's album data.

```tsx
<MusicPortfolio
  PROJECTS_DATA={albums}
  CONFIG={{
    timeZone: 'Asia/Kolkata',
    timeUpdateInterval: 1000,
    idleDelay: 4000,
  }}
  SOCIAL_LINKS={{
    spotify: 'https://...',
    email: 'mailto:...',
    x: 'https://...',
  }}
  LOCATION={{ display: false }}
/>
```

## Customization

- **Album data**: Edit `SANTHOSH_ALBUMS` in `app/sana-arena/page.tsx`
- **Colors**: Edit CSS variables in `src/components/ui/music-portfolio.css`
- **Corner links**: Pass different URLs in `SOCIAL_LINKS` prop
- **Location**: Set `LOCATION={{ display: true, latitude: '...', longitude: '...' }}`
