'use client';

import { useRef, useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import StickyRegisterCTA from '@/components/StickyRegisterCTA';
import { useLenis } from '@/hooks/useLenis';

// Music tracks configuration - update these paths when you provide the files
interface Track {
    id: string;
    title: string;
    artist?: string;
    src: string;
}

const TRACKS: Track[] = [
    // Add your tracks here - example format:
    // { id: '1', title: 'Song Title', artist: 'Artist Name', src: '/assets/audio/track1.mp3' },
];

export default function SanaArenaPage() {
    useLenis();
    const heroAudioRef = useRef<HTMLAudioElement | null>(null);
    const [isHeroPlaying, setIsHeroPlaying] = useState(false);
    
    // Music player state
    const playerAudioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

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

    // Music player audio management
    useEffect(() => {
        const audio = playerAudioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => {
            setIsPlayerPlaying(false);
            setCurrentTime(0);
            // Auto-play next track if available
            if (currentTrackIndex !== null && currentTrackIndex < TRACKS.length - 1) {
                handleTrackSelect(currentTrackIndex + 1);
            }
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentTrackIndex]);

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

    const handleTrackSelect = (index: number) => {
        if (index < 0 || index >= TRACKS.length) return;
        
        const track = TRACKS[index];
        const audio = new Audio(track.src);
        audio.preload = 'auto';
        
        // Stop previous audio
        if (playerAudioRef.current) {
            playerAudioRef.current.pause();
            playerAudioRef.current.src = '';
        }
        
        playerAudioRef.current = audio;
        setCurrentTrackIndex(index);
        setIsPlayerPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        
        // Load the track
        audio.load();
    };

    const togglePlayerPlay = () => {
        const audio = playerAudioRef.current;
        if (!audio) return;
        
        if (isPlayerPlaying) {
            audio.pause();
            setIsPlayerPlaying(false);
        } else {
            audio.play().then(() => setIsPlayerPlaying(true)).catch(() => {});
        }
    };

    const seekToPosition = (clientX: number, target: HTMLDivElement) => {
        const audio = playerAudioRef.current;
        if (!audio || !duration) return;
        const rect = target.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = x / rect.width;
        const newTime = percentage * duration;
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        seekToPosition(e.clientX, e.currentTarget);
    };

    const handleSeekTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.changedTouches[0];
        if (touch) seekToPosition(touch.clientX, e.currentTarget);
    };
    const handleSeekTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.changedTouches[0];
        if (touch) seekToPosition(touch.clientX, e.currentTarget);
    };
    const handleSeekTouchEnd = () => {};

    const formatTime = (seconds: number): string => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                    <div className="relative z-10 text-center u-container flex flex-col items-center justify-center text-white px-4 pt-8 pb-24 md:pt-20 md:pb-20">
                        <div className="mt-4 md:mt-12">
                            {/* Additional content or CTA can go here */}
                        </div>
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

                {/* Music Player Section - extra bottom padding on mobile for sticky CTA */}
                <section className="relative w-full py-10 sm:py-14 md:py-20 pb-24 md:pb-20 bg-black">
                    <div className="u-container px-4 sm:px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
                            {/* Cover Image - smaller on mobile */}
                            <div className="relative aspect-square max-w-[280px] w-full mx-auto md:max-w-none md:mx-0 rounded-lg overflow-hidden">
                                <img
                                    src="/assets/images/sana-music-cover.webp"
                                    alt="Sana Music Cover"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback if image doesn't exist yet
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                                {/* Placeholder if image not available */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-black/50 flex items-center justify-center">
                                    <div className="text-center text-white/60">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-2 opacity-50">
                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                        </svg>
                                        <p className="text-sm">Cover Image</p>
                                    </div>
                                </div>
                            </div>

                            {/* Track List & Player */}
                            <div className="space-y-4 sm:space-y-6 min-w-0">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-8">Sana's Music</h2>
                                
                                {/* Current Track Info */}
                                {currentTrackIndex !== null && currentTrackIndex < TRACKS.length && (
                                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/10">
                                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                            <button
                                                onClick={togglePlayerPlay}
                                                className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-white/20 hover:bg-white/30 active:scale-95 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all hover:scale-105 flex-shrink-0 touch-manipulation"
                                                aria-label={isPlayerPlaying ? 'Pause' : 'Play'}
                                            >
                                                {isPlayerPlaying ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-white truncate">
                                                    {TRACKS[currentTrackIndex].title}
                                                </h3>
                                                {TRACKS[currentTrackIndex].artist && (
                                                    <p className="text-sm text-white/60 truncate">
                                                        {TRACKS[currentTrackIndex].artist}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Progress Bar - touch-friendly min height */}
                                        <div className="space-y-2">
                                            <div
                                                onClick={handleSeek}
                                                onTouchStart={handleSeekTouchStart}
                                                onTouchMove={handleSeekTouchMove}
                                                onTouchEnd={handleSeekTouchEnd}
                                                className="w-full min-h-[28px] flex items-center cursor-pointer relative group -my-1 py-1"
                                            >
                                                <div className="w-full h-1.5 bg-white/10 rounded-full pointer-events-none">
                                                    <div
                                                        className="h-full bg-white/80 rounded-full transition-all"
                                                        style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-xs text-white/60">
                                                <span>{formatTime(currentTime)}</span>
                                                <span>{formatTime(duration)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Track List */}
                                {TRACKS.length > 0 ? (
                                    <div className="space-y-2">
                                        {TRACKS.map((track, index) => (
                                            <button
                                                key={track.id}
                                                onClick={() => handleTrackSelect(index)}
                                                className={`w-full text-left p-3 sm:p-4 rounded-lg transition-all touch-manipulation min-h-[48px] active:scale-[0.99] ${
                                                    currentTrackIndex === index
                                                        ? 'bg-white/10 border border-white/20'
                                                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                                                        {currentTrackIndex === index && isPlayerPlaying ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M8 5v14l11-7z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-white font-medium truncate">{track.title}</h4>
                                                        {track.artist && (
                                                            <p className="text-sm text-white/60 truncate">{track.artist}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 sm:p-8 border border-white/10 text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-4 text-white/40">
                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                        </svg>
                                        <p className="text-white/60">Music tracks will appear here</p>
                                        <p className="text-sm text-white/40 mt-2">Add tracks to the TRACKS array to get started</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <StickyRegisterCTA />
        </>
    );
}
