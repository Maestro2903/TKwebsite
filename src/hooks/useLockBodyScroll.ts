'use client';

import { useEffect } from 'react';
import { useLenisControl } from '@/contexts/LenisContext';

export function useLockBodyScroll(isOpen: boolean) {
  const { stop, start } = useLenisControl();

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const scrollY = window.scrollY || window.pageYOffset || 0;

    // Stop Lenis smooth scrolling
    stop();

    const { style } = document.body;
    const prevOverflow = style.overflow;
    const prevPosition = style.position;
    const prevTop = style.top;
    const prevWidth = style.width;

    style.overflow = 'hidden';
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.width = '100%';

    return () => {
      style.overflow = prevOverflow;
      style.position = prevPosition;
      style.top = prevTop;
      style.width = prevWidth;

      window.scrollTo(0, scrollY);

      // Restart Lenis
      start();
    };
  }, [isOpen, stop, start]);
}

