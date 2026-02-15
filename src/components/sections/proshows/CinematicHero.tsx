'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

interface CinematicHeroProps {
  backgroundImage: string;
}

export function CinematicHero({
  backgroundImage,
}: CinematicHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {}, heroRef);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleScroll = () => {
      if (!bgRef.current || prefersReducedMotion) return;
      const scrollY = window.scrollY;
      gsap.to(bgRef.current, {
        y: scrollY * 0.5,
        duration: 0.3,
        ease: 'none',
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      ctx.revert();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section ref={heroRef} className="proshows-hero">
      <div ref={bgRef} className="proshows-hero__bg-wrapper">
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="proshows-hero__background object-cover object-center"
        />
      </div>
      <div className="proshows-hero__overlay" aria-hidden />
    </section>
  );
}
