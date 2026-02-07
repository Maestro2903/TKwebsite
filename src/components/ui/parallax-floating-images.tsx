'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate, MotionValue } from 'framer-motion';

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

export default function ParallaxFloatingImages({ images, className }: ParallaxFloatingImagesProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Scroll Parallax
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    });

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
        >
            <ParallaxItems images={images} scrollYProgress={scrollYProgress} />
        </div>
    );
}

function ParallaxItems({ images, scrollYProgress }: { images: string[], scrollYProgress: MotionValue<number> }) {
    const { mouseX, mouseY } = useGlobalMouse();

    return (
        <>
            {images.slice(0, POSITIONS.length).map((src, i) => (
                <ParallaxItem
                    key={i}
                    src={src}
                    index={i}
                    position={POSITIONS[i]}
                    scrollYProgress={scrollYProgress}
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
    scrollYProgress: MotionValue<number>;
    mouseX: MotionValue<number>;
    mouseY: MotionValue<number>;
}

function ParallaxItem({ src, index, position, scrollYProgress, mouseX, mouseY }: ParallaxItemProps) {
    const scrollFactor = (index % 2 === 0 ? 1 : -1) * (50 + index * 10);
    const mouseFactor = (index % 2 === 0 ? -1 : 1) * (20 + index * 5);

    const y = useTransform(scrollYProgress, [0, 1], [0, scrollFactor]);
    const xMouse = useTransform(mouseX, (val) => val * mouseFactor);
    const yMouse = useTransform(mouseY, (val) => val * mouseFactor);

    // Combine transforms: scroll Y + mouse Y
    // x is just mouse X
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
