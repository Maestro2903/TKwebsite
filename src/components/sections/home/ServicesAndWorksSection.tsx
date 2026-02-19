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

        const { gsap, ScrollTrigger, SplitText } = gsapModules;
        const wrapper = wrapperRef.current;
        const text = textRef.current;
        if (!wrapper || !text || !SplitText) return;

        // Wait for DOM to be fully rendered
        const timeoutId = setTimeout(() => {
            try {
                const ctx = gsap.context(() => {
                    // Use GSAP's built-in matchMedia for responsive animations
                    const mm = gsap.matchMedia();
                    const splitRef: { current: any } = { current: null };

                    // DESKTOP VERSION: Horizontal scroll with pin and containerAnimation
                    mm.add('(min-width: 768px)', () => {
                        // Revert any existing split
                        if (splitRef.current) {
                            splitRef.current.revert();
                            splitRef.current = null;
                        }

                        // Split by characters for desktop horizontal scroll
                        splitRef.current = SplitText.create(text, { type: 'chars, words' });

                        // Calculate responsive end value based on text width
                        const textWidth = text.scrollWidth;
                        const viewportWidth = window.innerWidth;
                        const scrollDistance = Math.max(textWidth - viewportWidth + viewportWidth, 0);
                        const endValue = `+=${Math.max(scrollDistance, 5000)}`;

                        const scrollTween = gsap.to(text, {
                            xPercent: -100,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: wrapper,
                                pin: true,
                                pinSpacing: true,
                                start: 'top top',
                                end: endValue,
                                scrub: true,
                                invalidateOnRefresh: true,
                                anticipatePin: 1,
                                onLeave: () => wrapper.classList.add('Horizontal--ended'),
                                onLeaveBack: () => wrapper.classList.remove('Horizontal--ended'),
                                onUpdate: (self) => {
                                    if (self.progress === 1) wrapper.classList.add('Horizontal--ended');
                                    else if (self.direction === -1) wrapper.classList.remove('Horizontal--ended');
                                },
                            },
                        });

                        // Animate individual characters with containerAnimation
                        splitRef.current.chars.forEach((char: HTMLElement) => {
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
                                    invalidateOnRefresh: true,
                                },
                            });
                        });

                        return () => {
                            if (splitRef.current) {
                                splitRef.current.revert();
                                splitRef.current = null;
                            }
                        };
                    });

                    // MOBILE VERSION: Vertical scroll without pin or horizontal movement
                    mm.add('(max-width: 767px)', () => {
                        // Revert any existing split
                        if (splitRef.current) {
                            splitRef.current.revert();
                            splitRef.current = null;
                        }

                        // Split by WORDS only on mobile to preserve word wrapping
                        splitRef.current = SplitText.create(text, { type: 'words' });

                        // Animate words on vertical scroll (preserves word boundaries)
                        splitRef.current.words.forEach((word: HTMLElement) => {
                            gsap.from(word, {
                                y: 60,
                                opacity: 0,
                                ease: 'power3.out',
                                scrollTrigger: {
                                    trigger: word,
                                    start: 'top 85%',
                                    end: 'top 60%',
                                    scrub: 0.5,
                                    invalidateOnRefresh: true,
                                },
                            });
                        });

                        return () => {
                            if (splitRef.current) {
                                splitRef.current.revert();
                                splitRef.current = null;
                            }
                        };
                    });

                    // Cleanup function for matchMedia
                    return () => {
                        mm.revert();
                        if (splitRef.current) {
                            splitRef.current.revert();
                            splitRef.current = null;
                        }
                    };
                }, wrapper);

                return () => {
                    wrapper.classList.remove('Horizontal--ended');
                    ctx.revert();
                    ScrollTrigger.refresh();
                };
            } catch (error) {
                console.error('GSAP animation error:', error);
            }
        }, 100);

        return () => clearTimeout(timeoutId);
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
                    {QUOTE}
                </h3>
            </div>
        </section>
    );
}
