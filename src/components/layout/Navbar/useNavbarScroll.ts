'use client';

import { useEffect, useRef } from 'react';
import { useLenisControl } from '@/contexts/LenisContext';

const SCROLL_THRESHOLD = 20;
const SCROLL_TOP_THRESHOLD = 50;

/**
 * Hook for navbar scroll behavior: hide on scroll down, show on scroll up.
 * Uses data-* attributes on navRef for CSS-driven behavior (zero re-renders).
 * Implements scroll threshold to prevent jitter.
 * Lenis-aware: uses Lenis scroll event when available for smooth scroll sync.
 */
export function useNavbarScroll(navRef: React.RefObject<HTMLElement | null>) {
  const lastScrollYRef = useRef(0);
  const lastCommittedDirectionRef = useRef<'up' | 'down'>('up');
  const lastCommittedYRef = useRef(0);

  const { lenis } = useLenisControl();

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const updateNav = (scrollY: number) => {
      const atTop = scrollY < SCROLL_TOP_THRESHOLD;
      const scrolled = scrollY > SCROLL_TOP_THRESHOLD;
      const delta = scrollY - lastScrollYRef.current;
      const direction: 'up' | 'down' = delta > 0 ? 'down' : delta < 0 ? 'up' : lastCommittedDirectionRef.current;

      lastScrollYRef.current = scrollY;

      // Only commit direction change after threshold to prevent jitter
      const distanceFromCommitted = Math.abs(scrollY - lastCommittedYRef.current);
      if (distanceFromCommitted >= SCROLL_THRESHOLD || atTop) {
        lastCommittedDirectionRef.current = atTop ? 'up' : direction;
        lastCommittedYRef.current = scrollY;
      }

      const committedDirection = lastCommittedDirectionRef.current;

      el.setAttribute('data-scrolling-started', scrolled ? 'true' : 'false');
      el.setAttribute('data-scrolling-top', atTop ? 'true' : 'false');
      el.setAttribute('data-scrolling-direction', committedDirection);
    };

    const handleScroll = () => {
      const scrollY = typeof window !== 'undefined' ? window.scrollY ?? window.pageYOffset : 0;
      updateNav(scrollY);
    };

    let rafId: number | null = null;
    const rafScroll = () => {
      rafId = window.requestAnimationFrame(() => {
        handleScroll();
        rafId = null;
      });
    };

    if (lenis) {
      const scrollHandler = () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        const y = lenis.scroll;
        rafId = window.requestAnimationFrame(() => {
          updateNav(y);
          rafId = null;
        });
      };
      const unsub = lenis.on('scroll', scrollHandler);
      return () => {
        if (typeof unsub === 'function') unsub();
        else lenis.off?.('scroll', scrollHandler);
        if (rafId !== null) cancelAnimationFrame(rafId);
      };
    }

    window.addEventListener('scroll', rafScroll, { passive: true });
    // Initial sync
    handleScroll();
    return () => {
      window.removeEventListener('scroll', rafScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [navRef, lenis]);
}
