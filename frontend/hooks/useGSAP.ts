'use client';

import { useEffect, useRef, useState } from 'react';

interface GSAPModules {
  gsap: typeof import('gsap').default;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').default;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Flip?: any; // Using any to avoid case-sensitivity issues with gsap/Flip types
}

/**
 * Lazy loads GSAP and ScrollTrigger only when needed.
 * Returns the loaded modules and a loading state.
 */
export function useGSAP(loadFlip = false): [GSAPModules | null, boolean] {
  const [modules, setModules] = useState<GSAPModules | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || typeof window === 'undefined') return;
    loadedRef.current = true;

    setIsLoading(true);

    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      // Use dynamic import with type assertion to avoid case-sensitivity issues
      ...(loadFlip ? [import('gsap/dist/Flip').catch(() => import('gsap').then(g => ({ default: (g as any).Flip })))] : [Promise.resolve(null)]),
    ]).then(([gsapModule, scrollTriggerModule, flipModule]) => {
      const gsap = gsapModule.default;
      const ScrollTrigger = scrollTriggerModule.default;

      // Register plugins
      gsap.registerPlugin(ScrollTrigger);
      if (flipModule && flipModule.default) {
        gsap.registerPlugin(flipModule.default);
      }

      setModules({
        gsap,
        ScrollTrigger,
        ...(flipModule && flipModule.default ? { Flip: flipModule.default } : {}),
      });
      setIsLoading(false);
    }).catch((error) => {
      console.error('Failed to load GSAP:', error);
      setIsLoading(false);
    });
  }, [loadFlip]);

  return [modules, isLoading];
}
