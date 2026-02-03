'use client';

import {
  LiquidMetalComponent1,
  LiquidMetalComponent2,
  LiquidMetalComponent3,
  LiquidMetalComponent4,
  LiquidMetalComponent6,
  LiquidMetalComponent7,
  LiquidMetalComponent8,
} from '@/y2k';

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
  return (
    <div className="shows-hero__y2k" aria-hidden>
      {HERO_POSITIONS.map((pos, i) => {
        const Comp = HERO_COMPONENTS[i % HERO_COMPONENTS.length];
        return (
          <Y2KWrapper key={`hero-y2k-${i}`} position={pos}>
            <Comp />
          </Y2KWrapper>
        );
      })}
    </div>
  );
}

export function ProshowsY2KPage() {
  return (
    <div className="proshows-page__y2k" aria-hidden>
      {PAGE_POSITIONS.map((pos, i) => {
        const Comp = PAGE_COMPONENTS[i % PAGE_COMPONENTS.length];
        return (
          <Y2KWrapper key={`page-y2k-${i}`} position={pos}>
            <Comp />
          </Y2KWrapper>
        );
      })}
    </div>
  );
}
