'use client';

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import Lenis from '@studio-freight/lenis';

type GsapTicker = {
  add: (fn: (time?: number) => void) => void;
  remove: (fn: (time?: number) => void) => void;
  lagSmoothing: (n: number) => void;
};

type LenisContextValue = {
  lenis: Lenis | null;
  stop: () => void;
  start: () => void;
};

const LenisContext = createContext<LenisContextValue | undefined>(undefined);

interface LenisProviderProps {
  children: ReactNode;
}

export function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
      infinite: false,
      smoothTouch: true,
      syncTouch: true,
    });

    lenisRef.current = lenis;

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    let tickerCallback: ((time?: number) => void) | null = null;
    let gsapTicker: GsapTicker | null = null;

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

  const value: LenisContextValue = {
    lenis: lenisRef.current,
    stop: () => {
      if (lenisRef.current) {
        lenisRef.current.stop();
      }
    },
    start: () => {
      if (lenisRef.current) {
        lenisRef.current.start();
      }
    },
  };

  return <LenisContext.Provider value={value}>{children}</LenisContext.Provider>;
}

export function useLenisControl(): LenisContextValue {
  const ctx = useContext(LenisContext);

  if (!ctx) {
    return {
      lenis: null,
      stop: () => {},
      start: () => {},
    };
  }

  return ctx;
}

