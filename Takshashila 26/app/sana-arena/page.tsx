'use client';

import { useRef, useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import StickyRegisterCTA from '@/components/StickyRegisterCTA';
import { useLenis } from '@/hooks/useLenis';

export default function SanaArenaPage() {
    useLenis();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const audio = new Audio('/assets/audio/rakita_rakita.mp3');
        audio.loop = true;
        audio.preload = 'auto';
        audioRef.current = audio;

        const tryPlay = () => {
            audio.play().then(() => setIsPlaying(true)).catch(() => {});
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

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(() => {});
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <>
            <Navigation />

            <main id="main" className="page_main">
                <section
                    className="relative w-full flex items-center justify-center overflow-hidden"
                    style={{
                        marginTop: 'var(--nav-height, 64px)',
                        height: 'calc(100vh - var(--nav-height, 64px))',
                        minHeight: '600px',
                    }}
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            backgroundImage: "url('/assets/images/sana-arena-bg-2.jpeg')",
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        {/* Overlay for better text visibility */}
                        <div className="absolute inset-0 bg-black/40" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-center u-container flex flex-col items-center justify-center text-white pt-20">
                        <h1 className="text-[12vw] leading-none font-bold tracking-tighter mb-4 opacity-90">
                            SANA ARENA
                        </h1>
                        <p className="text-xl md:text-2xl font-light tracking-wide max-w-2xl mx-auto opacity-90">
                            Experience the ultimate proshow extravaganza
                        </p>

                        <div className="mt-12">
                            {/* Additional content or CTA can go here */}
                        </div>
                    </div>

                    {/* Music Play/Pause Button - floating bottom-right */}
                    <button
                        type="button"
                        onClick={togglePlay}
                        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all hover:scale-105"
                        aria-label={isPlaying ? 'Pause music' : 'Play music'}
                    >
                        {isPlaying ? (
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
            </main>

            <Footer />
            <StickyRegisterCTA />
        </>
    );
}
