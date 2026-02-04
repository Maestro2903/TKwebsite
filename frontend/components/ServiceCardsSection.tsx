'use client';

import { useEffect, useRef } from 'react';
import { useGSAP } from '@/hooks/useGSAP';

// CIT sticky cards - Excellence, Industry Ready, Vision
const SERVICES = [
    {
        number: '01',
        title: 'Excellence in Education',
        features: [
            'A prominent institution ranking amongst the top colleges in Tamil Nadu.',
            'Partnered with leading companies to offer diverse opportunities in education and recreation.',
        ],
        image: '/images/about/chairman.jpeg',
        isQuote: false,
    },
    {
        number: '02',
        title: 'Industry Ready',
        features: [
            'Our objective for establishing CIT is to transfer our knowledge to you, so that you can transform into a proper engineer',
            '~Shri Sriram Parthasarathy',
        ],
        image: '/images/about/students.jpeg',
        isQuote: true,
    },
    {
        number: '03',
        title: 'Our Vision',
        features: [
            "The students' appetite for knowledge makes them thrive to prepare for the ready-to-serve industrial requirements.",
            'Chennai Institute of Technology has been awarded the National Award of Excellence for Best Placements & has been ranked Second in Tamil Nadu.',
        ],
        image: '/images/about/students1.jpeg',
        isQuote: false,
    },
];

// Pixel-perfect clone of Zeit Media's service cards section
// Structure: sticky-card-wrap > sticky-card > services_item grid
export default function ServiceCardsSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [gsapModules, isLoading] = useGSAP();

    useEffect(() => {
        if (isLoading || !gsapModules) return;
        const { gsap, ScrollTrigger } = gsapModules;
        const ctx = gsap.context(() => {
            // Simple fade-in animation for each card as they enter viewport
            cardRefs.current.forEach((card) => {
                if (card) {
                    gsap.fromTo(
                        card,
                        { opacity: 0.3 },
                        {
                            opacity: 1,
                            duration: 0.6,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: card,
                                start: 'top 80%',
                                end: 'top 20%',
                                scrub: true,
                            },
                        }
                    );
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [isLoading, gsapModules]);

    return (
        <section ref={sectionRef} className="service-cards-section u-section">
            {/* Top spacer */}
            <div
                data-wf--spacer--section-space="main"
                className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
            />

            <div data-wf--content-wrapper--alignment="inherit" className="u-display-contents">
                <div className="u-content-wrapper u-zindex-3 u-container">
                    {SERVICES.map((service, index) => (
                        <div
                            key={service.number}
                            ref={(el) => { cardRefs.current[index] = el; }}
                            data-home-service=""
                            className="sticky-card-wrap"
                            style={{ zIndex: 10 + index }}
                        >
                            <div className="sticky-card">
                                <div className="services_item u-grid-custom">
                                    {/* Number Column - 1 column */}
                                    <div className="services_number_wrap u-column-1">
                                        <div className="u-opacity-60">{service.number}</div>
                                    </div>

                                    {/* Heading & Features Column - 4 columns */}
                                    <div className="services_heading_wrap u-column-4">
                                        <div>
                                            <h2 className="u-text-style-h3 u-margin-bottom-4">{service.title}</h2>
                                            <div className={`u-rich-text u-opacity-80 w-richtext ${service.isQuote ? 'services_card_quote' : ''}`}>
                                                {service.isQuote ? (
                                                    <>
                                                        <p className="services_quote_text">{service.features[0]}</p>
                                                        <p className="services_quote_attribution">{service.features[1]}</p>
                                                    </>
                                                ) : (
                                                    <ul role="list">
                                                        {service.features.map((feature, i) => (
                                                            <li key={i}>{feature}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Column - 6 columns starting at column 7 */}
                                    <div className="services_image_wrap u-column-6">
                                        <img
                                            src={service.image}
                                            loading="lazy"
                                            width={698}
                                            height={393}
                                            alt={service.title}
                                            sizes="(max-width: 767px) 100vw, 698px"
                                            className="services_image"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom spacer */}
            <div
                data-wf--spacer--section-space="main"
                className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
            />
        </section>
    );
}
