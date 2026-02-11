'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import StickyRegisterCTA from '@/components/layout/StickyRegisterCTA';
import MusicPortfolio from '@/components/ui/music-portfolio';
import PassCard from '@/components/ui/PassCard';
import { REGISTRATION_PASSES } from '@/data/passes';

const SANTHOSH_ALBUMS = [
  { id: 1, artist: 'SANTHOSH NARAYANAN', album: 'Irudhi Suttru', category: 'SOUNDTRACK', label: 'ORIGINAL MOTION PICTURE', year: '2016', image: '/assets/images/albumcover/1.png' },
  { id: 2, artist: 'SANTHOSH NARAYANAN', album: 'Jagame Thandhiram', category: 'SOUNDTRACK', label: 'ORIGINAL MOTION PICTURE', year: '2021', image: '/assets/images/albumcover/2.png' },
  { id: 3, artist: 'SANTHOSH NARAYANAN', album: 'Kaala', category: 'SOUNDTRACK', label: 'ORIGINAL MOTION PICTURE', year: '2018', image: '/assets/images/albumcover/3.png' },
  { id: 4, artist: 'SANTHOSH NARAYANAN', album: 'Kabali', category: 'SOUNDTRACK', label: 'ORIGINAL MOTION PICTURE', year: '2016', image: '/assets/images/albumcover/4.png' },
  { id: 5, artist: 'SANTHOSH NARAYANAN', album: 'Kalki 2898 Ad', category: 'SOUNDTRACK', label: 'TAMIL', year: '2024', image: '/assets/images/albumcover/5.png' },
  { id: 6, artist: 'SANTHOSH NARAYANAN', album: 'Karnan', category: 'SOUNDTRACK', label: 'ORIGINAL MOTION PICTURE', year: '2021', image: '/assets/images/albumcover/6.png' },
  { id: 7, artist: 'SANTHOSH NARAYANAN', album: 'Madras', category: 'SOUNDTRACK', label: 'ORIGINAL MOTION PICTURE', year: '2014', image: '/assets/images/albumcover/7.png' },
  { id: 8, artist: 'SANTHOSH NARAYANAN', album: 'Mahaan', category: 'SOUNDTRACK', label: 'ORIGINAL MOTION PICTURE', year: '2022', image: '/assets/images/albumcover/8.png' },
  { id: 9, artist: 'SANTHOSH NARAYANAN', album: 'Pizza', category: 'SOUNDTRACK', label: 'ORIGINAL MOTION PICTURE', year: '2012', image: '/assets/images/albumcover/9.png' },
  { id: 10, artist: 'SANTHOSH NARAYANAN', album: 'Retro', category: 'ALBUM', label: 'TAMIL', year: '2024', image: '/assets/images/albumcover/10.png' },
  { id: 11, artist: 'SANTHOSH NARAYANAN', album: 'Sarpatta Parambarai', category: 'SOUNDTRACK', label: 'ORIGINAL MOTION PICTURE', year: '2021', image: '/assets/images/albumcover/11.png' },
  { id: 12, artist: 'SANTHOSH NARAYANAN', album: 'VadaChennai', category: 'SOUNDTRACK', label: 'ORIGINAL MOTION PICTURE', year: '2018', image: '/assets/images/albumcover/12.png' },
];

export default function SanaArenaPage() {
    const router = useRouter();
    const heroAudioRef = useRef<HTMLAudioElement | null>(null);
    const [isHeroPlaying, setIsHeroPlaying] = useState(false);

    // Get the SANA pass (2000 rs all-access pass)
    const sanaPass = REGISTRATION_PASSES.find(pass => pass.passType === 'sana_concert');

    const handlePassRegister = () => {
        router.push('/register/pass');
    };

    // Hero background audio
    useEffect(() => {
        const audio = new Audio('/assets/audio/rakita_rakita.mp3');
        audio.loop = true;
        audio.preload = 'auto';
        heroAudioRef.current = audio;

        const tryPlay = () => {
            audio.play().then(() => setIsHeroPlaying(true)).catch(() => {});
        };

        // Attempt autoplay on mount
        tryPlay();

        // If blocked by browser, start on first user interaction (click/touch)
        const unlockPlay = () => {
            tryPlay();
            document.removeEventListener('click', unlockPlay);
            document.removeEventListener('touchstart', unlockPlay);
            document.removeEventListener('keydown', unlockPlay);
        };
        document.addEventListener('click', unlockPlay, { once: true });
        document.addEventListener('touchstart', unlockPlay, { once: true });
        document.addEventListener('keydown', unlockPlay, { once: true });

        return () => {
            document.removeEventListener('click', unlockPlay);
            document.removeEventListener('touchstart', unlockPlay);
            document.removeEventListener('keydown', unlockPlay);
            audio.pause();
            audio.src = '';
        };
    }, []);

    const toggleHeroPlay = () => {
        const audio = heroAudioRef.current;
        if (!audio) return;
        if (isHeroPlaying) {
            audio.pause();
        } else {
            audio.play().catch(() => {});
        }
        setIsHeroPlaying(!isHeroPlaying);
    };

    return (
        <>
            <Navigation />

            <main id="main" className="page_main">
                <section
                    className="relative w-full flex items-center justify-center overflow-hidden sana-hero"
                    style={{
                        marginTop: 'var(--nav-height, 64px)',
                        height: 'calc(100dvh - var(--nav-height, 64px))',
                        minHeight: 'min(400px, calc(100dvh - var(--nav-height, 64px)))',
                    }}
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            backgroundImage: "url('/assets/images/sana-arena-bg.webp')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        {/* Overlay for better text visibility */}
                        <div className="absolute inset-0 bg-black/40" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 w-full h-full u-container flex flex-col md:flex-row items-center justify-end md:justify-between gap-8 px-4 pt-8 pb-24 md:pt-20 md:pb-20">
                        {/* Left side - empty for now or can add content */}
                        <div className="flex-1 hidden md:block"></div>
                        
                        {/* Right side - Pass Card */}
                        {sanaPass && (
                            <div className="flex-shrink-0 w-full max-w-[360px] md:max-w-[360px]">
                                <PassCard pass={sanaPass} onRegister={handlePassRegister} />
                            </div>
                        )}
                    </div>

                    {/* Music Play/Pause Button - floating bottom-right, above sticky CTA on mobile */}
                    <button
                        type="button"
                        onClick={toggleHeroPlay}
                        className="fixed bottom-20 right-4 left-[auto] md:bottom-8 md:right-8 z-50 w-12 h-12 min-w-[48px] min-h-[48px] sm:w-14 sm:h-14 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all hover:scale-105 touch-manipulation"
                        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
                        aria-label={isHeroPlaying ? 'Pause music' : 'Play music'}
                    >
                        {isHeroPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>
                </section>

                {/* Music portfolio list + hover background - overflow-visible so vinyl is not cut off */}
                <section className="relative w-full bg-black overflow-visible" style={{ minHeight: '100vh' }}>
                    <MusicPortfolio
                        PROJECTS_DATA={SANTHOSH_ALBUMS}
                        CONFIG={{
                            timeZone: 'Asia/Kolkata',
                            timeUpdateInterval: 1000,
                            idleDelay: 4000,
                            debounceDelay: 100,
                        }}
                        SOCIAL_LINKS={{
                            spotify: 'https://open.spotify.com/artist/santhosh-narayanan',
                            email: 'mailto:hello@example.com',
                            x: 'https://x.com/santhosh_n',
                        }}
                        LOCATION={{ display: false }}
                    />
                </section>
            </main>

            <Footer />
            <StickyRegisterCTA />
        </>
    );
}
