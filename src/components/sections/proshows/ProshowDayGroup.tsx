'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CinematicProshowCard } from './CinematicProshowCard';
import type { CinematicProshowData } from '@/data/cinematic-proshows';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProshowDayGroupProps {
  day: number;
  dayLabel: string;
  dateText: string;
  shows: CinematicProshowData[];
  registerLink: string;
}

export function ProshowDayGroup({ day, dayLabel, dateText, shows, registerLink }: ProshowDayGroupProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        y: prefersReducedMotion ? 0 : 40,
        opacity: prefersReducedMotion ? 1 : 0,
        duration: prefersReducedMotion ? 0.01 : 0.8,
        ease: 'power3.out',
      });

      gsap.from(buttonRef.current, {
        scrollTrigger: {
          trigger: buttonRef.current,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        y: prefersReducedMotion ? 0 : 30,
        opacity: prefersReducedMotion ? 1 : 0,
        duration: prefersReducedMotion ? 0.01 : 0.8,
        ease: 'power3.out',
      });
    }, groupRef);

    return () => ctx.revert();
  }, []);

  const handleButtonHover = (isEntering: boolean) => {
    if (!buttonRef.current) return;
    
    const arrow = buttonRef.current.querySelector('.ProshowButtonArrow');
    gsap.to(arrow, {
      x: isEntering ? 4 : 0,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  return (
    <div ref={groupRef} className="ProshowDayGroup">
      <div ref={headerRef} className="ProshowDayGroup__header">
        <h2 className="ProshowDayGroup__title">{dayLabel}</h2>
        <span className="ProshowDayGroup__date">{dateText}</span>
      </div>
      
      <div className="ProshowDayGroup__shows">
        {shows.map((show, idx) => (
          <CinematicProshowCard key={show.id} show={show} index={idx} />
        ))}
      </div>

      <div className="ProshowDayGroup__footer">
        <a
          ref={buttonRef}
          href={registerLink}
          className="ProshowDayGroup__registerButton focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editorial-blue,#0047FF)] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          onMouseEnter={() => handleButtonHover(true)}
          onMouseLeave={() => handleButtonHover(false)}
        >
          <span>Register for {dayLabel}</span>
          <svg className="ProshowButtonArrow" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}
