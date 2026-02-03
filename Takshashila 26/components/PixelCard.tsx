'use client';

import { useEffect, useRef, useState } from 'react';

type PixelCardVariant = 'default' | 'blue' | 'yellow' | 'pink';

interface PixelCardProps {
    variant?: PixelCardVariant;
    gap?: number;
    speed?: number;
    colors?: string;
    noFocus?: boolean;
    className?: string;
    children?: React.ReactNode;
}

/**
 * PixelCard – Interactive hover-driven pixel canvas animation.
 * Use as accent interaction, not main page element.
 * 
 * Usage:
 * - Card content = position: absolute
 * - Canvas stays visual-only
 * - Button/CTAs always visible, explicitly pointer-events-auto
 */
export default function PixelCard({
    variant = 'default',
    gap = 5,
    speed = 35,
    colors,
    noFocus = false,
    className = '',
    children,
}: PixelCardProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    // Color palettes per variant
    const colorPalettes: Record<PixelCardVariant, string> = {
        default: '#f0f0f0,#363636,#1a1a1a',
        blue: '#00d8ff,#1a1a1a,#0066ff',
        yellow: '#ffcc00,#1a1a1a,#ff9500',
        pink: '#ff2d95,#1a1a1a,#ff007f',
    };

    const activeColors = colors || colorPalettes[variant];

    // Detect touch device and desktop
    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

        // Check if desktop (1024px or wider)
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        checkDesktop();
        window.addEventListener('resize', checkDesktop);

        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // Canvas pixel animation
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const colorArray = activeColors.split(',').map((c) => c.trim());
        const pixels: { x: number; y: number; color: string; alpha: number; targetAlpha: number }[] = [];
        let animationFrameId: number;
        let lastTime = 0;
        const frameInterval = 1000 / speed;

        // Setup canvas dimensions
        const resizeCanvas = () => {
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            ctx.scale(dpr, dpr);

            // Initialize pixel grid
            initPixels(rect.width, rect.height);
        };

        const initPixels = (width: number, height: number) => {
            pixels.length = 0;
            const cols = Math.ceil(width / gap);
            const rows = Math.ceil(height / gap);

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    pixels.push({
                        x: i * gap,
                        y: j * gap,
                        color: colorArray[Math.floor(Math.random() * colorArray.length)],
                        alpha: 0,
                        targetAlpha: 0,
                    });
                }
            }
        };

        const animate = (timestamp: number) => {
            if (timestamp - lastTime < frameInterval) {
                animationFrameId = requestAnimationFrame(animate);
                return;
            }
            lastTime = timestamp;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            pixels.forEach((pixel) => {
                // Randomly activate pixels when hovered, on touch devices, or on desktop
                if (isHovered || isTouchDevice || isDesktop) {
                    if (Math.random() < 0.03) {
                        pixel.targetAlpha = Math.random() * 0.8 + 0.2;
                        pixel.color = colorArray[Math.floor(Math.random() * colorArray.length)];
                    }
                } else {
                    pixel.targetAlpha = 0;
                }

                // Smooth alpha transition
                pixel.alpha += (pixel.targetAlpha - pixel.alpha) * 0.1;

                // Decay
                if (pixel.alpha > 0.01) {
                    pixel.targetAlpha *= 0.95;
                }

                if (pixel.alpha > 0.01) {
                    ctx.fillStyle = pixel.color;
                    ctx.globalAlpha = pixel.alpha * 0.6;
                    ctx.fillRect(pixel.x, pixel.y, gap - 1, gap - 1);
                }
            });

            ctx.globalAlpha = 1;
            animationFrameId = requestAnimationFrame(animate);
        };

        resizeCanvas();
        animationFrameId = requestAnimationFrame(animate);

        const resizeObserver = new ResizeObserver(() => resizeCanvas());
        resizeObserver.observe(container);

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
        };
    }, [gap, speed, activeColors, isHovered, isTouchDevice, isDesktop]);

    return (
        <div
            ref={containerRef}
            className={`pixel-card pixel-card--${variant} ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => !noFocus && setIsHovered(true)}
            onBlur={() => !noFocus && setIsHovered(false)}
            tabIndex={noFocus ? -1 : 0}
        >
            {/* Animated canvas background - visual only */}
            <canvas
                ref={canvasRef}
                className="pixel-card__canvas"
                aria-hidden="true"
            />

            {/* Gradient overlay for depth */}
            <div className="pixel-card__gradient" aria-hidden="true" />

            {/* Content layer - positioned above canvas */}
            <div className="pixel-card__content">{children}</div>
        </div>
    );
}
