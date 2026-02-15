'use client';

import { useEffect, useRef } from 'react';
import { useGSAP } from '@/hooks/useGSAP';
import { Y2K_IMAGES } from '@/data/y2k-images';
import ParallaxFloatingImages from '@/components/ui/parallax-floating-images';

const QUOTE =
    'We curate an exhilarating journey of technical challenges, creative arts, and musical extravaganzas fished straight out of the ocean.';

export default function ServicesAndWorksSection() {
    const wrapperRef = useRef<HTMLElement | null>(null);
    const textRef = useRef<HTMLHeadingElement | null>(null);
    const [gsapModules, isLoading] = useGSAP();

    useEffect(() => {
        if (isLoading || !gsapModules || !wrapperRef.current || !textRef.current) {
            return;
        }

        const { gsap } = gsapModules;
        const wrapper = wrapperRef.current;
        const text = textRef.current;
        if (!wrapper || !text) return;
        
        const chars = text.querySelectorAll<HTMLElement>('.Horizontal__char');

        try {
            const ctx = gsap.context(() => {
                const scrollTween = gsap.to(text, {
                    xPercent: -100,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: wrapper,
                        pin: true,
                        start: 'top top',
                        end: '+=5000',
                        scrub: true,
                        onLeave: () => wrapper.classList.add('Horizontal--ended'),
                        onLeaveBack: () => wrapper.classList.remove('Horizontal--ended'),
                        onUpdate: (self) => {
                            if (self.progress === 1) wrapper.classList.add('Horizontal--ended');
                            else if (self.direction === -1) wrapper.classList.remove('Horizontal--ended');
                        },
                    },
                });

                chars.forEach((char) => {
                    gsap.from(char, {
                        yPercent: () => gsap.utils.random(-200, 200),
                        rotation: () => gsap.utils.random(-20, 20),
                        ease: 'back.out(1.2)',
                        scrollTrigger: {
                            trigger: char,
                            containerAnimation: scrollTween,
                            start: 'left 100%',
                            end: 'left 30%',
                            scrub: 1,
                        },
                    });
                });
            }, wrapper);

            return () => {
                wrapper.classList.remove('Horizontal--ended');
                ctx.revert();
            };
        } catch (error) {
            console.error('GSAP animation error:', error);
        }
    }, [isLoading, gsapModules]);

    return (
        <section
            ref={wrapperRef}
            className="Horizontal"
            aria-label="What we do"
        >
            {/* Y2K icons background - same as About/Marquee; no grid so pinning doesn't reflow */}
            <ParallaxFloatingImages images={Y2K_IMAGES} className="Horizontal__y2k" mode="section" />

            <div className="Horizontal__container">
                <h3 ref={textRef} className="Horizontal__text heading-xl">
                    {QUOTE.split('').map((char, i) => (
                        <span key={i} className="Horizontal__char">
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </h3>
            </div>
        </section>
    );
}
