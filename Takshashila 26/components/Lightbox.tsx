'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface LightboxProps {
    isOpen: boolean;
    onClose: () => void;
    videoSrc: string;
}

export default function Lightbox({ isOpen, onClose, videoSrc }: LightboxProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const hlsRef = useRef<Hls | null>(null);

    useEffect(() => {
        if (!isOpen) {
            // Cleanup when closing
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            return;
        }

        const video = videoRef.current;
        if (!video || !videoSrc) return;

        if (Hls.isSupported()) {
            const hls = new Hls();
            hlsRef.current = hls;

            hls.loadSource(videoSrc);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().then(() => setIsPlaying(true));
            });

            return () => {
                hls.destroy();
                hlsRef.current = null;
            };
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoSrc;
            const onLoadedMetadata = () => {
                video.play().then(() => setIsPlaying(true));
            };
            video.addEventListener('loadedmetadata', onLoadedMetadata);

            return () => {
                video.removeEventListener('loadedmetadata', onLoadedMetadata);
                video.removeAttribute('src');
                video.load();
            };
        }
    }, [isOpen, videoSrc]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={`lightbox_overlay ${isOpen ? 'active' : ''}`}
            onClick={onClose}
        >
            <button
                className="lightbox_close"
                onClick={onClose}
                aria-label="Close lightbox"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            <div
                className="lightbox_video_wrap"
                onClick={(e) => e.stopPropagation()}
            >
                <video
                    ref={videoRef}
                    playsInline
                    controls
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />

                <button
                    onClick={togglePlayPause}
                    className="lightbox_playpause"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '4rem',
                        height: '4rem',
                        display: isPlaying ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '50%',
                        backdropFilter: 'blur(10px)',
                    }}
                    aria-label="Play video"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M6 12V5.01109C6 4.05131 7.03685 3.4496 7.87017 3.92579L14 7.42855L20.1007 10.9147C20.9405 11.3945 20.9405 12.6054 20.1007 13.0853L14 16.5714L7.87017 20.0742C7.03685 20.5503 6 19.9486 6 18.9889V12Z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
