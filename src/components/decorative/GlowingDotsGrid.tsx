'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

// Register GSAP plugins
if (typeof window !== 'undefined') {
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
    baseColor = "#245E51",
    activeColor = "#A8FF51",
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

        const container = containerRef.current;
        const colors = { base: baseColor, active: activeColor };
        let dots: Array<DotElement> = [];
        let dotCenters: Array<{ el: DotElement; x: number; y: number }> = [];

        function buildGrid() {
            container.innerHTML = "";
            dots = [];
            dotCenters = [];

            const style = getComputedStyle(container);
            const dotPx = parseFloat(style.fontSize);
            const gapPx = dotPx * 2;
            const contW = container.clientWidth;
            const contH = container.clientHeight;

            const cols = Math.floor((contW + gapPx) / (dotPx + gapPx));
            const rows = Math.floor((contH + gapPx) / (dotPx + gapPx));
            const total = cols * rows;

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
        buildGrid();

        const handleMouseMove = (e: MouseEvent) => {
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
                    }
                });
            });
        };

        const handleClick = (e: MouseEvent) => {
            dotCentersRef.current.forEach(({ el, x, y }) => {
                const dist = Math.hypot(x - e.pageX, y - e.pageY);
                if (dist < shockRadius && !el._inertiaApplied) {
                    el._inertiaApplied = true;
                    const falloff = Math.max(0, 1 - dist / shockRadius);
                    const pushX = (x - e.pageX) * shockPower * falloff;
                    const pushY = (y - e.pageY) * shockPower * falloff;

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
        />
    );
}
