'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

type TrailItem = {
  id: number;
  src: string;
  x: number;
  y: number;
  createdAt: number;
};

// Default Y2K-style icon set for cursor trails.
// Make sure these files exist under your project's `public` directory,
// e.g. `/public/images/y2k-icons/...`.
export const Y2K_TRAIL_IMAGES: string[] = [
  '/images/y2k-icons/icon-1.png',
  '/images/y2k-icons/icon-2.png',
  '/images/y2k-icons/icon-3.png',
];

export interface ImageCursorTrailProps {
  items: string[];
  maxNumberOfImages?: number;
  distance?: number;
  /** Tailwind / CSS classes applied to each image in the trail */
  imgClassName?: string;
  /** Deprecated alias for imgClassName (kept for API parity) */
  imgClass?: string;
  className?: string;
  /** Enable fade-out & auto-removal; defaults to true */
  fadeAnimation?: boolean;
  children?: React.ReactNode;
}

const DEFAULT_MAX_IMAGES = 8;
const DEFAULT_DISTANCE = 20;
const DEFAULT_LIFETIME_MS = 1500;

export function ImageCursorTrail({
  items,
  maxNumberOfImages = DEFAULT_MAX_IMAGES,
  distance = DEFAULT_DISTANCE,
  imgClassName,
  imgClass,
  className,
  fadeAnimation = true,
  children,
}: ImageCursorTrailProps) {
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const idRef = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const pickRandomSrc = useCallback(() => {
    if (!items || items.length === 0) return '';
    const index = Math.floor(Math.random() * items.length);
    return items[index] ?? items[0];
  }, [items]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!items || items.length === 0) return;

      const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const last = lastPointRef.current;
      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < distance) {
          return;
        }
      }

      lastPointRef.current = { x, y };

      const src = pickRandomSrc();
      if (!src) return;

      setTrail((prev) => {
        const now = Date.now();
        const next: TrailItem[] = [
          ...prev,
          {
            id: idRef.current++,
            src,
            x,
            y,
            createdAt: now,
          },
        ];

        if (next.length > maxNumberOfImages) {
          return next.slice(next.length - maxNumberOfImages);
        }
        return next;
      });
    },
    [distance, items, maxNumberOfImages, pickRandomSrc],
  );

  // Clean up old items if fadeAnimation is enabled
  useEffect(() => {
    if (!fadeAnimation) return;

    const interval = window.setInterval(() => {
      const cutoff = Date.now() - DEFAULT_LIFETIME_MS;
      setTrail((prev) => prev.filter((item) => item.createdAt >= cutoff));
    }, 150);

    return () => window.clearInterval(interval);
  }, [fadeAnimation]);

  // Reset trail when leaving the container
  const handleMouseLeave = useCallback(() => {
    lastPointRef.current = null;
    if (!fadeAnimation) {
      setTrail([]);
    }
  }, [fadeAnimation]);

  // Default to a 100x100px square if no explicit classes are provided.
  const imgClasses = imgClassName ?? imgClass ?? 'w-[32px] h-[32px]';

  return (
    <div
      ref={containerRef}
      className={clsx('relative overflow-hidden', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {trail.map((item) => (
          <motion.img
            key={item.id}
            src={item.src}
            alt=""
            className={clsx(
              'pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 select-none will-change-transform',
              imgClasses,
            )}
            style={{ left: item.x, top: item.y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

