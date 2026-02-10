'use client';

import { useEffect, useRef } from 'react';
import { useGSAP } from '@/hooks/useGSAP';

import { Y2K_IMAGES } from '@/data/y2k-images';
import ParallaxFloatingImages from '@/components/ui/parallax-floating-images';

// Exact HTML structure from original Zeit Media website for About Section with GSAP animations
export default function AboutSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const parallaxBgRef = useRef<HTMLDivElement>(null);
    const card1Ref = useRef<HTMLDivElement>(null);
    const card2Ref = useRef<HTMLDivElement>(null);
    const card3Ref = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const [gsapModules, isLoading] = useGSAP();

    // Use CDN URLs for images since local versions may not be available
    const parallaxImageSrc = '/assets/images/parallax.webp';

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

            // Parallax background image
            if (parallaxBgRef.current) {
                gsap.fromTo(
                    parallaxBgRef.current.querySelector('.parallax-img'),
                    { y: '-30%' },
                    {
                        y: '-10%',
                        ease: 'none',
                        scrollTrigger: {
                            trigger: parallaxBgRef.current,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 2,
                        },
                    }
                );
            }

            // Card 1 parallax animation
            if (card1Ref.current) {
                gsap.fromTo(
                    card1Ref.current,
                    { y: '20%', opacity: 0 },
                    {
                        y: '0%',
                        opacity: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: card1Ref.current,
                            start: 'top 90%',
                            end: 'top 50%',
                            scrub: 1,
                        },
                    }
                );
            }

            // Card 2 parallax animation
            if (card2Ref.current) {
                gsap.fromTo(
                    card2Ref.current,
                    { y: '30%', opacity: 0 },
                    {
                        y: '-10%',
                        opacity: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: card2Ref.current,
                            start: 'top 90%',
                            end: 'top 40%',
                            scrub: 1,
                        },
                    }
                );
            }

            // Card 3 parallax animation
            if (card3Ref.current) {
                gsap.fromTo(
                    card3Ref.current,
                    { y: '40%', opacity: 0 },
                    {
                        y: '-20%',
                        opacity: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: card3Ref.current,
                            start: 'top 90%',
                            end: 'top 30%',
                            scrub: 1,
                        },
                    }
                );
            }
        }, sectionRef);

        return () => ctx.revert();
    }, [isLoading, gsapModules]);

    return (
        <div ref={sectionRef} className="u-section u-zindex-3" style={{ position: 'relative' }}>
            <ParallaxFloatingImages images={Y2K_IMAGES} className="z-0" />
            <div
                data-wf--spacer--section-space="large"
                className="u-section-spacer w-variant-8cc18b30-4618-8767-0111-f6abfe45aaa3 u-ignore-trim"
            />

            <div className="u-container u-grid-custom relative z-10">
                <div className="about_heading u-column-8">
                    <h2
                        ref={headingRef}
                        data-heading="heading-animation"
                        className="home_about_heading"
                    >
                        TAKSHASHILA
                    </h2>
                    <div
                        data-wf--typography-paragraph--font-style="inherit"
                        className="c-paragraph w-richtext u-rich-text u-max-width-60ch u-opacity-80 u-margin-bottom-7"
                    >
                        <p>
                        GenZ Kondattam where vibes, voices, and vision collide
                        </p>
                        <p>Takshashila, the flagship techno cultural fest of Chennai Institute of Technology, is back to set the stage alive as Tamil Nadu’s most awaited cultural celebration. It’s where creativity, innovation, and passion collide, giving students the freedom to express, experiment, and excel. This year, Takshashila embraces its theme GenZ Kondattam, celebrating the bold energy, fearless expression, and ever-evolving culture of today’s generation.</p>
                        <p>From trend-driven performances and culture-forward showcases to cutting-edge technical challenges and innovation-led events, the fest thrives on movement, momentum, and modern expression. Takshashila is more than a fest — it’s an experience that builds confidence, fuels collaboration, and amplifies voices that refuse to blend in. With a dynamic lineup of workshops, competitions, and technical presentations led by industry experts, Takshashila promises a celebration where ideas move fast, creativity runs loud, and Gen Z takes center stage.</p>
                    </div>
                    <div className="btn-group">
                        <a href="/events" className="btn-bubble-arrow w-inline-block">
                            <div className="btn-bubble-arrow__arrow">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width="100%"
                                    className="btn-bubble-arrow__arrow-svg"
                                >
                                    <polyline
                                        points="18 8 18 18 8 18"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeMiterlimit={10}
                                        strokeWidth={1.5}
                                    />
                                    <line
                                        x1="18"
                                        y1="18"
                                        x2="5"
                                        y2="5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeMiterlimit={10}
                                        strokeWidth={1.5}
                                    />
                                </svg>
                            </div>
                            <div className="btn-bubble-arrow__content">
                                <span className="btn-bubble-arrow__content-text">Learn More</span>
                            </div>
                            <div className="btn-bubble-arrow__arrow is--duplicate">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width="100%"
                                    className="btn-bubble-arrow__arrow-svg"
                                >
                                    <polyline
                                        points="18 8 18 18 8 18"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeMiterlimit={10}
                                        strokeWidth={1.5}
                                    />
                                    <line
                                        x1="18"
                                        y1="18"
                                        x2="5"
                                        y2="5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeMiterlimit={10}
                                        strokeWidth={1.5}
                                    />
                                </svg>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <div
                data-wf--spacer--section-space="large"
                className="u-section-spacer w-variant-8cc18b30-4618-8767-0111-f6abfe45aaa3 u-ignore-trim"
            />

            {/* Parallax Stats Section */}
            <div className="parallax-demo-row__half">
                <div
                    ref={parallaxBgRef}
                    data-parallax-scrub="2"
                    data-parallax="trigger"
                    data-parallax-start="-30"
                    data-parallax-end="-10"
                    className="parallax-bg"
                >
                    <img
                        src={parallaxImageSrc}
                        loading="lazy"
                        width={2752}
                        height={1536}
                        alt=""
                        sizes="100vw"
                        className="parallax-img"
                    />
                </div>

                <div className="parallax-demo-row u-container">
                    {/* Card 1: 200+ */}
                    <div className="parallax-demo-row__third">
                        <div
                            ref={card1Ref}
                            data-parallax-end="0"
                            data-parallax="trigger"
                            data-parallax-disable="mobileLandscape"
                            data-parallax-start="20"
                            className="parallax-demo-card"
                        >
                            <div>
                                <div
                                    data-heading=""
                                    data-wf--typography-heading--font-style="display"
                                    className="c-heading w-variant-41c609dc-9c80-9eef-75df-03bf0eea00b4 w-richtext u-margin-bottom-4"
                                >
                                    <h2>50+</h2>
                                </div>
                                <div
                                    data-wf--typography-paragraph--font-style="text-large"
                                    className="c-paragraph w-variant-fdb8e663-01e0-aae6-13eb-e6dfca16b689 w-richtext u-rich-text u-max-width-20ch u-weight-bold u-line-height-large"
                                >
                                    <p>Technical &amp; Non-Technical Events</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: 1000+ */}
                    <div className="parallax-demo-row__third">
                        <div
                            ref={card2Ref}
                            data-parallax-disable="mobileLandscape"
                            data-parallax="trigger"
                            data-parallax-start="30"
                            data-parallax-end="-10"
                            className="parallax-demo-card"
                        >
                            <div>
                                <div
                                    data-heading=""
                                    data-wf--typography-heading--font-style="display"
                                    className="c-heading w-variant-41c609dc-9c80-9eef-75df-03bf0eea00b4 w-richtext u-margin-bottom-4"
                                >
                                    <h2>15,000+</h2>
                                </div>
                                <div
                                    data-wf--typography-paragraph--font-style="text-large"
                                    className="c-paragraph w-variant-fdb8e663-01e0-aae6-13eb-e6dfca16b689 w-richtext u-rich-text u-max-width-20ch u-weight-bold u-line-height-large"
                                >
                                    <p>Students &amp; Attendees from across India</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: 50+ */}
                    <div className="parallax-demo-row__third">
                        <div
                            ref={card3Ref}
                            data-parallax-disable="mobileLandscape"
                            data-parallax="trigger"
                            data-parallax-start="40"
                            data-parallax-end="-20"
                            className="parallax-demo-card"
                        >
                            <div>
                                <div
                                    data-heading=""
                                    data-wf--typography-heading--font-style="display"
                                    className="c-heading w-variant-41c609dc-9c80-9eef-75df-03bf0eea00b4 w-richtext u-margin-bottom-4"
                                >
                                    <h2>₹20 Lakhs+</h2>
                                </div>
                                <div
                                    data-wf--typography-paragraph--font-style="text-large"
                                    className="c-paragraph w-variant-fdb8e663-01e0-aae6-13eb-e6dfca16b689 w-richtext u-rich-text u-max-width-12ch u-weight-bold u-line-height-large"
                                >
                                    <p>Total Prize Pool &amp; Awards</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
