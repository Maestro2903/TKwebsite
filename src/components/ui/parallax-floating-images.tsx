'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate, MotionValue } from 'framer-motion';

interface ParallaxFloatingImagesProps {
    images: string[];
    className?: string;
    mode?: 'section' | 'global';
}

// Predefined positions to avoid the center (where text is)
// Values are in percentages (left, top)
const POSITIONS = [
    // Layer 1 - Deep Background
    { left: 5, top: 10, scale: 0.6, rotate: -15, zIndex: 0 },
    { left: 25, top: 15, scale: 0.5, rotate: 10, zIndex: 0 },
    { left: 85, top: 20, scale: 0.7, rotate: -20, zIndex: 0 },
    { left: 15, top: 40, scale: 0.5, rotate: 25, zIndex: 0 },
    { left: 75, top: 45, scale: 0.6, rotate: -10, zIndex: 0 },
    { left: 10, top: 70, scale: 0.7, rotate: 15, zIndex: 0 },
    { left: 90, top: 80, scale: 0.5, rotate: -25, zIndex: 0 },
    { left: 35, top: 85, scale: 0.6, rotate: 20, zIndex: 0 },
    { left: 65, top: 90, scale: 0.5, rotate: -15, zIndex: 0 },

    // Layer 2 - Mid Ground
    { left: 15, top: 5, scale: 0.9, rotate: 10, zIndex: 1 },
    { left: 70, top: 8, scale: 0.8, rotate: -5, zIndex: 1 },
    { left: 92, top: 30, scale: 1.0, rotate: 15, zIndex: 1 },
    { left: 5, top: 55, scale: 0.9, rotate: -20, zIndex: 1 },
    { left: 88, top: 65, scale: 0.8, rotate: 10, zIndex: 1 },
    { left: 20, top: 90, scale: 1.0, rotate: -10, zIndex: 1 },
    { left: 55, top: 95, scale: 0.9, rotate: 25, zIndex: 1 },
    { left: 45, top: 5, scale: 0.8, rotate: -15, zIndex: 1 },

    // Layer 3 - Foreground
    { left: 82, top: 12, scale: 1.2, rotate: -10, zIndex: 2 },
    { left: 8, top: 25, scale: 1.1, rotate: 20, zIndex: 2 },
    { left: 95, top: 50, scale: 1.3, rotate: -5, zIndex: 2 },
    { left: 12, top: 60, scale: 1.2, rotate: 15, zIndex: 2 },
    { left: 78, top: 75, scale: 1.1, rotate: -20, zIndex: 2 },
    { left: 28, top: 85, scale: 1.3, rotate: 10, zIndex: 2 },

    // Extra positions for overflow
    { left: 40, top: 12, scale: 0.5, rotate: -30, zIndex: 0 },
    { left: 60, top: 18, scale: 0.6, rotate: 30, zIndex: 0 },
    { left: 30, top: 35, scale: 0.7, rotate: -45, zIndex: 0 },
    { left: 70, top: 38, scale: 0.5, rotate: 45, zIndex: 0 },
    { left: 22, top: 55, scale: 0.6, rotate: -60, zIndex: 0 },
    { left: 78, top: 58, scale: 0.7, rotate: 60, zIndex: 0 },
    { left: 35, top: 75, scale: 0.5, rotate: -15, zIndex: 0 },
    { left: 65, top: 72, scale: 0.6, rotate: 15, zIndex: 0 },
    { left: 50, top: 88, scale: 0.7, rotate: -30, zIndex: 0 },
    { left: 95, top: 5, scale: 0.6, rotate: 30, zIndex: 0 },
    { left: 5, top: 95, scale: 0.5, rotate: -45, zIndex: 0 },
    { left: 42, top: 2, scale: 0.7, rotate: 45, zIndex: 1 },
    { left: 58, top: 98, scale: 0.6, rotate: -60, zIndex: 1 },
    { left: 2, top: 45, scale: 0.8, rotate: 60, zIndex: 1 },
];

// Shared mouse position context to avoid multiple window listeners
function useGlobalMouse() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            mouseX.set((e.clientX / innerWidth) - 0.5);
            mouseY.set((e.clientY / innerHeight) - 0.5);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return { mouseX, mouseY };
}

export default function ParallaxFloatingImages({ images, className, mode = 'section' }: ParallaxFloatingImagesProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll(); // Global scroll
    const { scrollYProgress } = useScroll({ // Section scroll
        target: containerRef,
        offset: ['start end', 'end start'],
    });

    const isGlobal = mode === 'global';

    // Choose the driver and range based on mode
    const scrollValue = isGlobal ? scrollY : scrollYProgress;
    const inputRange = isGlobal ? [0, 1000] : [0, 1];

    return (
        <div
            ref={containerRef}
            className={`${isGlobal ? 'fixed' : 'absolute'} inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}
            style={{ zIndex: isGlobal ? 0 : undefined }}
        >
            <ParallaxItems
                images={images}
                scrollValue={scrollValue}
                inputRange={inputRange}
            />
        </div>
    );
}

function ParallaxItems({ images, scrollValue, inputRange }: {
    images: string[],
    scrollValue: MotionValue<number>,
    inputRange: number[]
}) {
    const { mouseX, mouseY } = useGlobalMouse();

    return (
        <>
            {images.slice(0, POSITIONS.length).map((src, i) => (
                <ParallaxItem
                    key={i}
                    src={src}
                    index={i}
                    position={POSITIONS[i % POSITIONS.length]}
                    scrollValue={scrollValue}
                    inputRange={inputRange}
                    mouseX={mouseX}
                    mouseY={mouseY}
                />
            ))}
        </>
    );
}

interface ParallaxItemProps {
    src: string;
    index: number;
    position: typeof POSITIONS[number];
    scrollValue: MotionValue<number>;
    inputRange: number[];
    mouseX: MotionValue<number>;
    mouseY: MotionValue<number>;
}

function ParallaxItem({ src, index, position, scrollValue, inputRange, mouseX, mouseY }: ParallaxItemProps) {
    const scrollFactor = (index % 2 === 0 ? 1 : -1) * (50 + index * 5);
    const mouseFactor = (index % 2 === 0 ? -1 : 1) * (20 + index * 5);

    const y = useTransform(scrollValue, inputRange, [0, scrollFactor]);
    const xMouse = useTransform(mouseX, (val) => val * mouseFactor);
    const yMouse = useTransform(mouseY, (val) => val * mouseFactor);

    // Combine transforms: scroll Y + mouse Y
    const x = xMouse;
    const totalY = useMotionTemplate`calc(${y}px + ${yMouse}px)`;

    return (
        <motion.div
            className="absolute"
            style={{
                left: `${position.left}%`,
                top: `${position.top}%`,
                rotate: position.rotate,
                scale: position.scale,
                zIndex: position.zIndex,
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
}
