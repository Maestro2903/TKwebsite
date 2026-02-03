'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Lazy load Y2K shader components - they're heavy and should only load when in viewport
const LiquidMetalComponent1 = dynamic(() => import('@/y2k').then(mod => ({ default: mod.LiquidMetalComponent1 })), { ssr: false });
const LiquidMetalComponent2 = dynamic(() => import('@/y2k').then(mod => ({ default: mod.LiquidMetalComponent2 })), { ssr: false });
const LiquidMetalComponent3 = dynamic(() => import('@/y2k').then(mod => ({ default: mod.LiquidMetalComponent3 })), { ssr: false });
const LiquidMetalComponent4 = dynamic(() => import('@/y2k').then(mod => ({ default: mod.LiquidMetalComponent4 })), { ssr: false });
const LiquidMetalComponent6 = dynamic(() => import('@/y2k').then(mod => ({ default: mod.LiquidMetalComponent6 })), { ssr: false });
const LiquidMetalComponent7 = dynamic(() => import('@/y2k').then(mod => ({ default: mod.LiquidMetalComponent7 })), { ssr: false });
const LiquidMetalComponent8 = dynamic(() => import('@/y2k').then(mod => ({ default: mod.LiquidMetalComponent8 })), { ssr: false });

/** Fixed “random” positions across the page (deterministic for SSR). */
const PAGE_POSITIONS: Array<{ top: string; left?: string; right?: string; width: number; height: number; opacity: number }> = [
  { top: '12%', left: '3%', width: 220, height: 260, opacity: 0.35 },
  { top: '28%', right: '8%', width: 200, height: 240, opacity: 0.4 },
  { top: '55%', left: '5%', width: 240, height: 280, opacity: 0.3 },
  { top: '72%', right: '4%', width: 180, height: 220, opacity: 0.38 },
  { top: '88%', left: '12%', width: 200, height: 240, opacity: 0.32 },
  { top: '45%', right: '18%', width: 160, height: 200, opacity: 0.35 },
  { top: '62%', left: '15%', width: 190, height: 230, opacity: 0.3 },
];

/** Hero positions — 3 elements in the hero. */
const HERO_POSITIONS: Array<{ top: string; left?: string; right?: string; width: number; height: number; opacity: number }> = [
  { top: '8%', left: '6%', width: 280, height: 320, opacity: 0.5 },
  { top: '55%', right: '10%', width: 260, height: 300, opacity: 0.45 },
  { top: '75%', left: '8%', width: 240, height: 280, opacity: 0.4 },
];

const HERO_COMPONENTS = [
  LiquidMetalComponent1,
  LiquidMetalComponent2,
  LiquidMetalComponent3,
] as const;

const PAGE_COMPONENTS = [
  LiquidMetalComponent4,
  LiquidMetalComponent6,
  LiquidMetalComponent7,
  LiquidMetalComponent8,
  LiquidMetalComponent1,
  LiquidMetalComponent2,
  LiquidMetalComponent3,
] as const;

type Position = (typeof PAGE_POSITIONS)[number];

function Y2KWrapper({
  position,
  children,
  className = '',
}: {
  position: Position;
  children: React.ReactNode;
  className?: string;
}) {
  const { top, left, right, width, height, opacity } = position;
  return (
    <div
      className={`y2k-decor-wrap ${className}`.trim()}
      style={{
        position: 'absolute',
        top,
        left,
        right,
        width,
        height,
        opacity,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        backgroundColor: 'transparent',
      }}
      aria-hidden
    >
      <div
        className="y2k-decor-inner"
        style={{
          transform: 'scale(0.42)',
          transformOrigin: 'top left',
          width: 600,
          height: 600,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function ProshowsY2KHero() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldLoad || typeof window === 'undefined' || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' } // Start loading 100px before entering viewport
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className="shows-hero__y2k" aria-hidden>
      {shouldLoad && HERO_POSITIONS.map((pos, i) => {
        const Comp = HERO_COMPONENTS[i % HERO_COMPONENTS.length];
        return (
          <Y2KWrapper key={`hero-y2k-${i}`} position={pos}>
            <Suspense fallback={null}>
              <Comp />
            </Suspense>
          </Y2KWrapper>
        );
      })}
    </div>
  );
}

export function ProshowsY2KPage() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldLoad || typeof window === 'undefined' || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' } // Start loading 200px before entering viewport
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className="proshows-page__y2k" aria-hidden>
      {shouldLoad && PAGE_POSITIONS.map((pos, i) => {
        const Comp = PAGE_COMPONENTS[i % PAGE_COMPONENTS.length];
        return (
          <Y2KWrapper key={`page-y2k-${i}`} position={pos}>
            <Suspense fallback={null}>
              <Comp />
            </Suspense>
          </Y2KWrapper>
        );
      })}
    </div>
  );
}
