'use client';

import { useEffect } from 'react';
import { useLenisControl } from '@/contexts/LenisContext';

function getScrollbarWidth(): number {
  if (typeof document === 'undefined') return 0;
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  outer.style.width = '100px';
  document.body.appendChild(outer);
  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.remove();
  return scrollbarWidth;
}

export function useLockBodyScroll(isOpen: boolean) {
  const { stop, start } = useLenisControl();

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const scrollY = window.scrollY || window.pageYOffset || 0;
    const scrollbarWidth = getScrollbarWidth();

    stop();

    const { style } = document.body;
    const html = document.documentElement;
    const prevOverflow = style.overflow;
    const prevPosition = style.position;
    const prevTop = style.top;
    const prevWidth = style.width;
    const prevPaddingRight = style.paddingRight;
    const prevHtmlOverflow = html.style.overflow;

    style.overflow = 'hidden';
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.width = '100%';
    if (scrollbarWidth > 0) {
      style.paddingRight = `${scrollbarWidth}px`;
    }
    html.style.overflow = 'hidden';

    return () => {
      style.overflow = prevOverflow;
      style.position = prevPosition;
      style.top = prevTop;
      style.width = prevWidth;
      style.paddingRight = prevPaddingRight;
      html.style.overflow = prevHtmlOverflow;

      window.scrollTo(0, scrollY);

      start();
    };
  }, [isOpen, stop, start]);
}

