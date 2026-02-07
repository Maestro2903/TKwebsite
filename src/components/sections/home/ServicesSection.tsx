'use client';

import { useEffect, useRef } from 'react';
import { useGSAP } from '@/hooks/useGSAP';

import { Y2K_IMAGES } from '@/data/y2k-images';
import ParallaxFloatingImages from '@/components/ui/parallax-floating-images';

// Exact HTML structure from original Zeit Media website for Services Section
export default function ServicesSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const [gsapModules, isLoading] = useGSAP();

    useEffect(() => {
        if (isLoading || !gsapModules) return;
        const { gsap, ScrollTrigger } = gsapModules;
        const ctx = gsap.context(() => {
            // Heading animation
            if (headingRef.current) {
                gsap.fromTo(
                    headingRef.current,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: headingRef.current,
                            start: 'top 80%',
                            end: 'top 50%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            }

            // Button animation
            if (buttonRef.current) {
                gsap.fromTo(
                    buttonRef.current,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        delay: 0.2,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: buttonRef.current,
                            start: 'top 90%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            }
        }, sectionRef);

        return () => ctx.revert();
    }, [isLoading, gsapModules]);

    return (
        <section ref={sectionRef} data-wf--section--theme="inherit" className="u-section" style={{ position: 'relative' }}>
            <ParallaxFloatingImages images={Y2K_IMAGES} className="z-0" />
            <div
                data-wf--spacer--section-space="main"
                className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
            />
            <div className="section_contain">
                <div className="u-container u-grid-custom">
                    <div className="about_eyebrow_wrap u-column-4">
                        <div className="eyebrow_wrap">
                            <div className="eyebrow_layout">
                                <div className="eyebrow_marker" />
                                <div className="eyebrow_text u-text-style-main w-richtext">
                                    <p>What we do</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="about_heading u-column-8">
                        <h2
                            ref={headingRef}
                            data-heading="heading-animation"
                            className="u-text-style-h2 u-margin-bottom-8"
                        >
                            We create, produce, and design experiences that make brands hit different.
                        </h2>
                        <div
                            ref={buttonRef}
                            data-wf--button-main--style="primary"
                            className="button_main_wrap"
                            data-button=" "
                        >
                            <div className="clickable_wrap u-cover-absolute">
                                <a
                                    target=""
                                    href="/services"
                                    className="clickable_link w-inline-block"
                                >
                                    <span className="clickable_text u-sr-only">[ All Services ]</span>
                                </a>
                                <button type="button" className="clickable_btn">
                                    <span className="clickable_text u-sr-only">[ All Services ]</span>
                                </button>
                            </div>
                            <div aria-hidden="true" className="button_main_text u-text-style-main">
                                [ All Services ]
                            </div>
                            <div className="button_bg" />
                        </div>
                        <a href="/about" className="w-inline-block" />
                        <div className="btn-group" />
                    </div>
                </div>
            </div>
        </section>
    );
}
