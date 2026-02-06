'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Try to import InertiaPlugin, but don't fail if it's missing (it's a Club GSAP plugin)
let InertiaPlugin: any;
try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const InertiaModule = require('gsap/InertiaPlugin');
    InertiaPlugin = InertiaModule.InertiaPlugin || InertiaModule.default || InertiaModule;
} catch (e) {
    console.warn("GSAP InertiaPlugin not found. Physics animations will be simplified.", e);
}

// Register GSAP plugins
if (typeof window !== 'undefined' && InertiaPlugin) {
    gsap.registerPlugin(InertiaPlugin);
}

// Type for dot elements with custom properties
type DotElement = HTMLDivElement & { _isHole?: boolean; _inertiaApplied?: boolean };

interface GlowingDotsGridProps {
    baseColor?: string;
    activeColor?: string;
    threshold?: number;
    speedThreshold?: number;
    shockRadius?: number;
    shockPower?: number;
    maxSpeed?: number;
    centerHole?: boolean;
}

export default function GlowingDotsGrid({
    baseColor = "#333333", // Lighter grey for better visibility on black
    activeColor = "#A8FF51", // Bright lime
    threshold = 200,
    speedThreshold = 100,
    shockRadius = 325,
    shockPower = 5,
    maxSpeed = 5000,
    centerHole = true,
}: GlowingDotsGridProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const dotsRef = useRef<Array<DotElement>>([]);
    const dotCentersRef = useRef<Array<{ el: DotElement; x: number; y: number }>>([]);
    const lastTimeRef = useRef(0);
    const lastXRef = useRef(0);
    const lastYRef = useRef(0);

    useEffect(() => {
        if (!containerRef.current) return;

        console.log("GlowingDotsGrid mounting...");
        const container = containerRef.current;
        const colors = { base: baseColor, active: activeColor };
        let dots: Array<DotElement> = [];
        let dotCenters: Array<{ el: DotElement; x: number; y: number }> = [];

        function buildGrid() {
            if (!container) return;
            container.innerHTML = "";
            dots = [];
            dotCenters = [];

            const style = getComputedStyle(container);
            // Fallback to 4px if fontSize cannot be determined
            const fontSizeVal = parseFloat(style.fontSize);
            const dotPx = isNaN(fontSizeVal) || fontSizeVal === 0 ? 4 : fontSizeVal;
            const gapPx = dotPx * 2;
            const contW = container.clientWidth || window.innerWidth;
            const contH = container.clientHeight || window.innerHeight;

            if (contW === 0 || contH === 0) {
                console.warn("GlowingDotsGrid container has 0 size. Retrying in 100ms...");
                setTimeout(buildGrid, 100);
                return;
            }

            const cols = Math.floor((contW + gapPx) / (dotPx + gapPx));
            const rows = Math.floor((contH + gapPx) / (dotPx + gapPx));
            const total = cols * rows;

            console.log(`Building grid: ${cols}x${rows} (${total} dots), dotSize: ${dotPx}px`);

            const holeCols = centerHole ? (cols % 2 === 0 ? 4 : 5) : 0;
            const holeRows = centerHole ? (rows % 2 === 0 ? 4 : 5) : 0;
            const startCol = (cols - holeCols) / 2;
            const startRow = (rows - holeRows) / 2;

            for (let i = 0; i < total; i++) {
                const row = Math.floor(i / cols);
                const col = i % cols;
                const isHole = centerHole &&
                    row >= startRow && row < startRow + holeRows &&
                    col >= startCol && col < startCol + holeCols;

                const d = document.createElement("div") as DotElement;
                d.classList.add("dot");

                // Force base styles inline in case CSS fails
                d.style.width = `${dotPx}px`;
                d.style.height = `${dotPx}px`;
                d.style.borderRadius = "50%";
                d.style.position = "absolute"; // Grid placement handled by grid layout usually, but here we append. 
                // Wait, the original code relied on CSS Grid layout for positioning?
                // The original code calculates rows/cols but just appends divs.
                // The CSS sets display: grid. So we just need to add them.

                // Reset standard properties
                if (isHole) {
                    d.style.visibility = "hidden";
                    d._isHole = true;
                } else {
                    gsap.set(d, { x: 0, y: 0, backgroundColor: colors.base });
                    d._inertiaApplied = false;
                }

                container.appendChild(d);
                dots.push(d);
            }

            requestAnimationFrame(() => {
                dotCenters = dots
                    .filter(d => !d._isHole)
                    .map(d => {
                        const r = d.getBoundingClientRect();
                        return {
                            el: d,
                            x: r.left + window.scrollX + r.width / 2,
                            y: r.top + window.scrollY + r.height / 2
                        };
                    });
                dotCentersRef.current = dotCenters;
            });

            dotsRef.current = dots;
        }

        const handleResize = () => buildGrid();
        window.addEventListener("resize", handleResize);

        // Initial build
        buildGrid();

        const handleMouseMove = (e: MouseEvent) => {
            if (!dotCentersRef.current.length) return;

            const now = performance.now();
            const dt = now - lastTimeRef.current || 16;
            let dx = e.pageX - lastXRef.current;
            let dy = e.pageY - lastYRef.current;
            let vx = dx / dt * 1000;
            let vy = dy / dt * 1000;
            let speed = Math.hypot(vx, vy);

            if (speed > maxSpeed) {
                const scale = maxSpeed / speed;
                vx *= scale;
                vy *= scale;
                speed = maxSpeed;
            }

            lastTimeRef.current = now;
            lastXRef.current = e.pageX;
            lastYRef.current = e.pageY;

            requestAnimationFrame(() => {
                dotCentersRef.current.forEach(({ el, x, y }) => {
                    const dist = Math.hypot(x - e.pageX, y - e.pageY);
                    const t = Math.max(0, 1 - dist / threshold);
                    const col = gsap.utils.interpolate(colors.base, colors.active, t);
                    gsap.set(el, { backgroundColor: col });

                    if (speed > speedThreshold && dist < threshold && !el._inertiaApplied) {
                        el._inertiaApplied = true;
                        const pushX = (x - e.pageX) + vx * 0.005;
                        const pushY = (y - e.pageY) + vy * 0.005;

                        // Use InertiaPlugin if available
                        if (InertiaPlugin) {
                            gsap.to(el, {
                                inertia: { x: pushX, y: pushY, resistance: 750 },
                                onComplete() {
                                    gsap.to(el, {
                                        x: 0,
                                        y: 0,
                                        duration: 1.5,
                                        ease: "elastic.out(1,0.75)"
                                    });
                                    el._inertiaApplied = false;
                                }
                            });
                        } else {
                            // Fallback simple animation
                            gsap.to(el, {
                                x: pushX * 0.5, // Less intense push
                                y: pushY * 0.5,
                                duration: 0.3,
                                onComplete() {
                                    gsap.to(el, {
                                        x: 0,
                                        y: 0,
                                        duration: 1.0,
                                        ease: "elastic.out(1,0.75)"
                                    });
                                    el._inertiaApplied = false;
                                }
                            });
                        }
                    }
                });
            });
        };

        // Handle Click (Shockwave)
        const handleClick = (e: MouseEvent) => {
            dotCentersRef.current.forEach(({ el, x, y }) => {
                const dist = Math.hypot(x - e.pageX, y - e.pageY);
                if (dist < shockRadius && !el._inertiaApplied) {
                    el._inertiaApplied = true;
                    const falloff = Math.max(0, 1 - dist / shockRadius);
                    const pushX = (x - e.pageX) * shockPower * falloff;
                    const pushY = (y - e.pageY) * shockPower * falloff;

                    if (InertiaPlugin) {
                        gsap.to(el, {
                            inertia: { x: pushX, y: pushY, resistance: 750 },
                            onComplete() {
                                gsap.to(el, {
                                    x: 0,
                                    y: 0,
                                    duration: 1.5,
                                    ease: "elastic.out(1,0.75)"
                                });
                                el._inertiaApplied = false;
                            }
                        });
                    } else {
                        // Fallback
                        gsap.to(el, {
                            x: pushX,
                            y: pushY,
                            duration: 0.4,
                            ease: "power2.out",
                            onComplete() {
                                gsap.to(el, {
                                    x: 0,
                                    y: 0,
                                    duration: 1.5,
                                    ease: "elastic.out(1,0.75)"
                                });
                                el._inertiaApplied = false;
                            }
                        });
                    }
                }
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("click", handleClick);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("click", handleClick);
        };
    }, [baseColor, activeColor, threshold, speedThreshold, shockRadius, shockPower, maxSpeed, centerHole]);

    return (
        <div
            ref={containerRef}
            className="glowing-dots-grid"
            data-dots-container-init
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                // Ensure visibility
                display: 'grid',
                width: '100%',
                height: '100%'
            }}
        />
    );
}
