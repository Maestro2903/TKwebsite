'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AwardBadge } from '@/components/decorative/AwardBadge';

interface HeroSectionProps {
    onShowReelClick?: () => void;
}

// Desktop/Tablet video sources (landscape)
const desktopVideoSources = [
    { src: '/videos/hero-bg-optimized.webm', type: 'video/webm' },
    { src: '/videos/hero-bg.mp4', type: 'video/mp4' },
];

// Mobile video sources (portrait)
const mobileVideoSources = [
    { src: '/videos/hero-bg-mobile-optimized.webm', type: 'video/webm' },
];

export default function HeroSection({ onShowReelClick }: HeroSectionProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const [playerStatus, setPlayerStatus] = useState<'idle' | 'loading' | 'ready' | 'playing' | 'paused'>('idle');
    const [playerActivated, setPlayerActivated] = useState(false);
    const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile on mount and window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(max-width: 767px)');

        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            setIsMobile(e.matches);
        };

        // Set initial value
        handleChange(mediaQuery);

        // Listen for changes
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Select video sources based on device
    const videoSources = isMobile ? mobileVideoSources : desktopVideoSources;
    const videoSrc = videoSources[0].src; /* for data attributes / fallback */

    // IntersectionObserver: only start loading video when section is near viewport
    useEffect(() => {
        if (typeof window === 'undefined' || !sectionRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setShouldLoadVideo(true);
                        observer.disconnect();
                    }
                });
            },
            { rootMargin: '50px' } // Start loading 50px before entering viewport
        );

        observer.observe(sectionRef.current);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!shouldLoadVideo) return;
        const video = videoRef.current;
        if (!video) return;

        setPlayerStatus('loading');
        video.load();

        const onCanPlay = () => {
            setPlayerStatus('ready');
            video.play()
                .then(() => {
                    setPlayerStatus('playing');
                    setPlayerActivated(true);
                })
                .catch(() => {
                    setPlayerStatus('ready');
                });
        };

        const onError = () => {
            setPlayerStatus('idle');
        };

        video.addEventListener('canplay', onCanPlay);
        video.addEventListener('error', onError);
        video.load();

        return () => {
            video.removeEventListener('canplay', onCanPlay);
            video.removeEventListener('error', onError);
        };
    }, [shouldLoadVideo]);

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setPlayerStatus('playing');
        } else {
            video.pause();
            setPlayerStatus('paused');
        }
    };

    return (
        <section ref={sectionRef} className="u-section u-min-height-screen u-zindex-3">
            <div
                data-wf--spacer--section-space="main"
                className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
            />

            <div className="home_hero_contain u-container">
                {/* Video Background - bunny-bg */}
                <div
                    data-player-activated={playerActivated ? 'true' : 'false'}
                    data-bunny-background-init=""
                    data-player-src={videoSrc}
                    data-player-status={playerStatus}
                    data-player-lazy="false"
                    data-player-autoplay="true"
                    className="bunny-bg"
                >
                    <video
                        key={isMobile ? 'mobile' : 'desktop'}
                        ref={videoRef}
                        poster="/assets/images/hero-poster.webp"
                        preload={shouldLoadVideo ? "auto" : "none"}
                        width={isMobile ? 1440 : 1920}
                        height={isMobile ? 2560 : 1080}
                        playsInline
                        muted
                        loop
                        className="bunny-bg__video"
                    >
                        {videoSources.map(({ src, type }) => (
                            <source key={type} src={src} type={type} />
                        ))}
                    </video>

                    {/* Hero center logo overlay - Takshashila 2026 with Register CTA */}
                    <div className="hero_center_logo" aria-hidden={false}>
                        <div className="hero_center_logo__inner">
                            <Image
                                src="/images/tk-26-logo.png"
                                alt="Takshashila 2026 logo"
                                width={1200}
                                height={600}
                                priority
                                className="hero_center_logo__img hero_center_logo__img--text"
                            />
                            <div className="hero_center_logo__cta">
                                <AwardBadge href="/register" className="hero_center_logo__cta-badge">
                                    REGISTER NOW
                                </AwardBadge>
                            </div>
                        </div>
                    </div>

                    <div data-player-control="playpause" className="bunny-bg__playpause">
                        <button className="bunny-bg__btn" onClick={togglePlayPause} aria-label={playerStatus === 'playing' ? 'Pause' : 'Play'}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="100%"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="bunny-bg__pause-svg"
                            >
                                <path d="M16 5V19" stroke="currentColor" strokeWidth="3" strokeMiterlimit="10" />
                                <path d="M8 5V19" stroke="currentColor" strokeWidth="3" strokeMiterlimit="10" />
                            </svg>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="100%"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="bunny-bg__play-svg"
                            >
                                <path
                                    d="M6 12V5.01109C6 4.05131 7.03685 3.4496 7.87017 3.92579L14 7.42855L20.1007 10.9147C20.9405 11.3945 20.9405 12.6054 20.1007 13.0853L14 16.5714L7.87017 20.0742C7.03685 20.5503 6 19.9486 6 18.9889V12Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="bunny-bg__loading">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            version="1.1"
                            id="L9"
                            x="0px"
                            y="0px"
                            viewBox="0 0 100 100"
                            enableBackground="new 0 0 0 0"
                            xmlSpace="preserve"
                            width="100%"
                            className="bunny-bg__loading-svg vimeo-player__loading-svg"
                            fill="none"
                        >
                            <path
                                fill="currentColor"
                                d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
                            >
                                <animateTransform
                                    attributeName="transform"
                                    attributeType="XML"
                                    type="rotate"
                                    dur="1s"
                                    from="0 50 50"
                                    to="360 50 50"
                                    repeatCount="indefinite"
                                />
                            </path>
                        </svg>
                    </div>
                </div>

            </div>
        </section>
    );
}
