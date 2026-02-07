'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';

interface ParallaxFloatingImagesProps {
    images: string[];
    className?: string;
}

// Predefined positions to avoid the center (where text is)
// Values are in percentages (left, top)
const POSITIONS = [
    { left: 10, top: 10, scale: 0.8, rotate: -10, zIndex: 1 },
    { left: 80, top: 15, scale: 1.1, rotate: 15, zIndex: 2 },
    { left: 5, top: 50, scale: 0.9, rotate: -5, zIndex: 3 },
    { left: 85, top: 60, scale: 1.2, rotate: 20, zIndex: 1 },
    { left: 20, top: 80, scale: 0.7, rotate: 10, zIndex: 2 },
    { left: 70, top: 85, scale: 1.0, rotate: -15, zIndex: 3 },
    { left: 35, top: 5, scale: 0.6, rotate: 5, zIndex: 1 },
    { left: 60, top: 5, scale: 0.8, rotate: -20, zIndex: 1 },
    { left: 10, top: 30, scale: 0.5, rotate: 10, zIndex: 0 },
    { left: 90, top: 40, scale: 0.7, rotate: -10, zIndex: 0 },
];

export default function ParallaxFloatingImages({ images, className }: ParallaxFloatingImagesProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Scroll Parallax
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    });

    // Mouse Parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth mouse movement
    const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const x = (clientX / innerWidth) - 0.5;
        const y = (clientY / innerHeight) - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    };

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
        >
            {/* We attach mouse listener to window or parent usually, but here we can just rely on the parent checking mouse if we want, 
            OR we can make this component fill the screen. 
            However, since it's "pointer-events-none", it won't catch events.
            We will attach the listener to the window in a useEffect for robustness, 
            or assume the parent passes it, OR just make a global listener.
            Let's use a global window listener for mouse position to be safe and simple.
        */}
            <ParallaxItems images={images} scrollYProgress={scrollYProgress} />
        </div>
    );
}

function ParallaxItems({ images, scrollYProgress }: { images: string[], scrollYProgress: any }) {

    // Mouse tracking via window for "reacts to mouse hover" anywhere on screen (or just section)
    // The user said "reacts to mouse hover", usually implies local, but global feels smoother for parallax.
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    React.useEffect(() => {
        const handleVerboseMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            mouseX.set((e.clientX / innerWidth) - 0.5);
            mouseY.set((e.clientY / innerHeight) - 0.5);
        };
        window.addEventListener('mousemove', handleVerboseMouseMove);
        return () => window.removeEventListener('mousemove', handleVerboseMouseMove);
    }, [mouseX, mouseY]);

    return (
        <>
            {images.slice(0, POSITIONS.length).map((src, i) => {
                const pos = POSITIONS[i];
                // Randomize parallax intensity
                const scrollFactor = (i % 2 === 0 ? 1 : -1) * (50 + i * 10);
                const mouseFactor = (i % 2 === 0 ? -1 : 1) * (20 + i * 5);

                const y = useTransform(scrollYProgress, [0, 1], [0, scrollFactor]);
                const xMouse = useTransform(mouseX, (val) => val * mouseFactor);
                const yMouse = useTransform(mouseY, (val) => val * mouseFactor);

                // Combine transforms
                const x = xMouse;
                const totalY = useMotionTemplate`calc(${y}px + ${yMouse}px)`;

                return (
                    <motion.div
                        key={i}
                        className="absolute"
                        style={{
                            left: `${pos.left}%`,
                            top: `${pos.top}%`,
                            rotate: pos.rotate,
                            scale: pos.scale,
                            zIndex: pos.zIndex,
                            x,
                            y: totalY,
                        }}
                    >
                        <img
                            src={src}
                            alt=""
                            className="w-16 h-16 md:w-24 md:h-24 object-contain opacity-80"
                        />
                    </motion.div>
                );
            })}
        </>
    );
}
