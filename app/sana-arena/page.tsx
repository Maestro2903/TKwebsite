'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    const [arenaOpen, setArenaOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // Get the SANA pass (2000 rs all-access pass)
    const sanaPass = REGISTRATION_PASSES.find(pass => pass.passType === 'sana_concert');

    const handlePassRegister = () => {
        router.push('/register/pass');
    };

    const handleCloseArena = () => {
        setIsClosing(true);
        setTimeout(() => {
            setArenaOpen(false);
            setIsClosing(false);
        }, 600); // Match the CSS transition duration
    };

    return (
        <>
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
                            backgroundImage: "url('/assets/images/sana.png')",
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

                    {/* Enter the Arena Button - bottom center */}
                    <button
                        type="button"
                        onClick={() => setArenaOpen(true)}
                        className="arena-btn absolute bottom-20 left-1/2 -translate-x-1/2 z-20 touch-manipulation group"
                    >
                        {/* 1. Musical Notes floating from left and right */}
                        <span className="arena-btn__notes-container">
                            {/* Notes from left - continuous stream */}
                            <span className="arena-btn__notes arena-btn__notes--left">
                                <span className="arena-btn__note" style={{animationDelay: '0s'}}>♪</span>
                                <span className="arena-btn__note" style={{animationDelay: '0.5s'}}>♫</span>
                                <span className="arena-btn__note" style={{animationDelay: '1s'}}>♩</span>
                                <span className="arena-btn__note" style={{animationDelay: '1.5s'}}>♬</span>
                                <span className="arena-btn__note" style={{animationDelay: '2s'}}>𝅘𝅥𝅮</span>
                                <span className="arena-btn__note" style={{animationDelay: '2.5s'}}>♪</span>
                                <span className="arena-btn__note" style={{animationDelay: '3s'}}>♫</span>
                                <span className="arena-btn__note" style={{animationDelay: '3.5s'}}>♩</span>
                                <span className="arena-btn__note" style={{animationDelay: '4s'}}>♬</span>
                                <span className="arena-btn__note" style={{animationDelay: '4.5s'}}>♪</span>
                                <span className="arena-btn__note" style={{animationDelay: '5s'}}>♫</span>
                                <span className="arena-btn__note" style={{animationDelay: '5.5s'}}>𝅘𝅥𝅮</span>
                                <span className="arena-btn__note" style={{animationDelay: '6s'}}>♩</span>
                                <span className="arena-btn__note" style={{animationDelay: '6.5s'}}>♬</span>
                                <span className="arena-btn__note" style={{animationDelay: '7s'}}>♪</span>
                                <span className="arena-btn__note" style={{animationDelay: '7.5s'}}>♫</span>
                                <span className="arena-btn__note" style={{animationDelay: '8s'}}>♩</span>
                                <span className="arena-btn__note" style={{animationDelay: '8.5s'}}>♬</span>
                                <span className="arena-btn__note" style={{animationDelay: '9s'}}>𝅘𝅥𝅮</span>
                                <span className="arena-btn__note" style={{animationDelay: '9.5s'}}>♪</span>
                                <span className="arena-btn__note" style={{animationDelay: '10s'}}>♫</span>
                                <span className="arena-btn__note" style={{animationDelay: '10.5s'}}>♩</span>
                                <span className="arena-btn__note" style={{animationDelay: '11s'}}>♬</span>
                                <span className="arena-btn__note" style={{animationDelay: '11.5s'}}>♪</span>
                            </span>
                            {/* Notes from right - continuous stream */}
                            <span className="arena-btn__notes arena-btn__notes--right">
                                <span className="arena-btn__note" style={{animationDelay: '0.25s'}}>♫</span>
                                <span className="arena-btn__note" style={{animationDelay: '0.75s'}}>♩</span>
                                <span className="arena-btn__note" style={{animationDelay: '1.25s'}}>♪</span>
                                <span className="arena-btn__note" style={{animationDelay: '1.75s'}}>♬</span>
                                <span className="arena-btn__note" style={{animationDelay: '2.25s'}}>𝅘𝅥𝅯</span>
                                <span className="arena-btn__note" style={{animationDelay: '2.75s'}}>♫</span>
                                <span className="arena-btn__note" style={{animationDelay: '3.25s'}}>♪</span>
                                <span className="arena-btn__note" style={{animationDelay: '3.75s'}}>♩</span>
                                <span className="arena-btn__note" style={{animationDelay: '4.25s'}}>♬</span>
                                <span className="arena-btn__note" style={{animationDelay: '4.75s'}}>♫</span>
                                <span className="arena-btn__note" style={{animationDelay: '5.25s'}}>♪</span>
                                <span className="arena-btn__note" style={{animationDelay: '5.75s'}}>𝅘𝅥𝅯</span>
                                <span className="arena-btn__note" style={{animationDelay: '6.25s'}}>♩</span>
                                <span className="arena-btn__note" style={{animationDelay: '6.75s'}}>♬</span>
                                <span className="arena-btn__note" style={{animationDelay: '7.25s'}}>♫</span>
                                <span className="arena-btn__note" style={{animationDelay: '7.75s'}}>♪</span>
                                <span className="arena-btn__note" style={{animationDelay: '8.25s'}}>♩</span>
                                <span className="arena-btn__note" style={{animationDelay: '8.75s'}}>♬</span>
                                <span className="arena-btn__note" style={{animationDelay: '9.25s'}}>𝅘𝅥𝅯</span>
                                <span className="arena-btn__note" style={{animationDelay: '9.75s'}}>♫</span>
                                <span className="arena-btn__note" style={{animationDelay: '10.25s'}}>♪</span>
                                <span className="arena-btn__note" style={{animationDelay: '10.75s'}}>♩</span>
                                <span className="arena-btn__note" style={{animationDelay: '11.25s'}}>♬</span>
                                <span className="arena-btn__note" style={{animationDelay: '11.75s'}}>♫</span>
                            </span>
                        </span>

                        {/* 2. Glass Reflection Overlay */}
                        <span className="arena-btn__glass" />

                        {/* 3. Text Content */}
                        <span className="arena-btn__text">Enter the Arena</span>
                    </button>
                </section>

            </main>

            {/* Fullscreen Arena Overlay */}
            {arenaOpen && (
                <div
                    className={`arena-overlay ${isClosing ? 'arena-closing' : 'arena-opening'}`}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: '#000',
                        animation: isClosing 
                            ? 'arenaFadeOut 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' 
                            : 'arenaFadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                    }}
                >
                    {/* Close button */}
                    <button
                        type="button"
                        onClick={handleCloseArena}
                        className="absolute top-5 right-5 z-[10000] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
                        aria-label="Close arena"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

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
                </div>
            )}

            <Footer />
            <StickyRegisterCTA />
        </>
    );
}
