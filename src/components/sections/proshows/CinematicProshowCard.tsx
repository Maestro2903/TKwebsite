'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarcodeStripe, SectionLabel } from '@/components/decorative/EditorialMotifs';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CinematicProshowCardProps {
  show: {
    id: string;
    title: string;
    dayLabel: string;
    dateText: string;
    description: string;
    poster: string;
    registerLink: string;
  };
  index?: number;
}

export function CinematicProshowCard({ show, index = 0 }: CinematicProshowCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: prefersReducedMotion ? 0 : 60,
        opacity: prefersReducedMotion ? 1 : 0,
        duration: prefersReducedMotion ? 0.01 : 1,
        ease: 'power3.out',
      });
    }, cardRef);

    return () => ctx.revert();
  }, []);

  const handleMouseEnter = () => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    if (imageRef.current && contentRef.current) {
      const img = imageRef.current.querySelector('img');
      if (img) {
        gsap.to(img, { scale: 1.08, duration: 0.6, ease: 'power2.out' });
      }
      gsap.to(contentRef.current, { y: -4, duration: 0.4, ease: 'power2.out' });
    }
  };

  const handleMouseLeave = () => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    if (imageRef.current && contentRef.current) {
      const img = imageRef.current.querySelector('img');
      if (img) {
        gsap.to(img, { scale: 1, duration: 0.6, ease: 'power2.out' });
      }
      gsap.to(contentRef.current, { y: 0, duration: 0.4, ease: 'power2.out' });
    }
  };

  return (
    <article 
      ref={cardRef}
      className="ProshowCard"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={imageRef} className="ProshowImageWrapper relative">
        <Image
          src={show.poster}
          alt={show.title}
          fill
          sizes="(max-width: 991px) 100vw, 50vw"
          className="object-contain object-center"
        />
        <div className="ProshowImageOverlay" />
      </div>
      <div ref={contentRef} className="ProshowContent">
        <div className="ProshowHeader">
          <SectionLabel className="text-[var(--editorial-gray-muted,#999)] mb-1 block">
            PROSHOW /// {String(index + 1).padStart(3, '0')}
          </SectionLabel>
          <h3 className="ProshowTitle">{show.title}</h3>
          <BarcodeStripe variant="horizontal" color="white" className="opacity-60 max-w-[80px]" />
          {show.description && (
            <>
              <SectionLabel className="text-[var(--editorial-gray-muted,#999)] mt-4 mb-2 block">
                ABOUT
              </SectionLabel>
              <p className="ProshowDescription">{show.description}</p>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
