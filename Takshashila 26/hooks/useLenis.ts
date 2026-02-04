'use client';

import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

export function useLenis() {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        lenisRef.current = lenis;

        let rafId: number;
        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        type GsapTicker = { add: (fn: (time?: number) => void) => void; remove: (fn: (time?: number) => void) => void; lagSmoothing: (n: number) => void };
        let tickerCallback: ((time?: number) => void) | null = null;
        let gsapTicker: GsapTicker | null = null;
        // Sync with GSAP ScrollTrigger if available (ticker.add passes deltaTime)
        if (typeof window !== 'undefined' && (window as unknown as { gsap?: { ticker?: GsapTicker } }).gsap?.ticker) {
            gsapTicker = (window as unknown as { gsap: { ticker: GsapTicker } }).gsap.ticker;
            tickerCallback = (time?: number) => {
                lenis.raf((time ?? 0) * 1000);
            };
            gsapTicker.add(tickerCallback);
            gsapTicker.lagSmoothing(0);
        }

        return () => {
            cancelAnimationFrame(rafId);
            if (tickerCallback && gsapTicker) {
                gsapTicker.remove(tickerCallback);
            }
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    return lenisRef;
}
