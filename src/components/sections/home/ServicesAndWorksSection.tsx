'use client';

import { useEffect, useRef } from 'react';
import { useGSAP } from '@/hooks/useGSAP';
import { Y2K_IMAGES } from '@/data/y2k-images';

const QUOTE =
    'We curate an exhilarating journey of technical challenges, creative arts, and musical extravaganzas fished straight out of the ocean.';

// Flagship events - Highlights grid
const PROJECTS = [
    {
        slug: 'sana-arena',
        year: '2026',
        category: 'Pro-Show',
        title: 'SANA ARENA',
        client: 'Live Concert featuring Yuvan Shankar Raja. The Maestro returns to the stage.',
        image: '/images/event/nontech/BATTLE%20OF%20BANDS.webp',
    },
    {
        slug: 'mr-machinist',
        year: '2026',
        category: 'Technical',
        title: 'MR. MACHINIST',
        client: 'The ultimate test of mechanical engineering skills and innovation.',
        image: '/images/event/tech/REVERSEENGINEERING.jpg',
    },
    {
        slug: 'choreo-night',
        year: '2026',
        category: 'Cultural',
        title: 'CHOREO NIGHT',
        client: 'A spectacular dance battle showcasing group synchronisation and style.',
        image: '/images/event/nontech/CHOREO%20SHOWCASE.webp',
    },
    {
        slug: 'hackathon-2026',
        year: '2026',
        category: 'Technical',
        title: 'HACKATHON 2026',
        client: 'A 24-hour coding marathon to solve real-world industrial problems.',
        image: '/images/event/tech/tech%20quest.jpg',
    },
    {
        slug: 'shipwreck',
        year: '2026',
        category: 'Non-Technical',
        title: 'SHIPWRECK',
        client: 'A test of wit and spontaneity where you talk your way out of a sinking ship.',
        image: '/images/event/nontech/TREASURE%20HUNT.webp',
    },
];

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

export default function ServicesAndWorksSection() {
    const wrapperRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const highlightsRef = useRef<HTMLDivElement>(null);
    const worksGridRef = useRef<HTMLDivElement>(null);
    const stickySectionRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [gsapModules, isLoading] = useGSAP();

    useEffect(() => {
        if (isLoading || !gsapModules || !wrapperRef.current || !textRef.current) return;

        const { gsap, ScrollTrigger } = gsapModules;
        const wrapper = wrapperRef.current;
        const text = textRef.current;
        const chars = text.querySelectorAll<HTMLElement>('.Horizontal__char');

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

        return () => ctx.revert();
    }, [isLoading, gsapModules]);

    // Highlights / works grid animation
    useEffect(() => {
        if (isLoading || !gsapModules || !highlightsRef.current || !worksGridRef.current) return;
        const { gsap, ScrollTrigger } = gsapModules;
        const ctx = gsap.context(() => {
            const workItems = worksGridRef.current?.querySelectorAll('.home_work_item');
            if (workItems?.length) {
                gsap.fromTo(
                    workItems,
                    { opacity: 0, y: 60 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        stagger: 0.1,
                        scrollTrigger: {
                            trigger: worksGridRef.current,
                            start: 'top 75%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            }
        }, highlightsRef.current);

        return () => ctx.revert();
    }, [isLoading, gsapModules]);

    // Sticky cards scroll animations
    useEffect(() => {
        if (isLoading || !gsapModules || !stickySectionRef.current) return;
        const { gsap, ScrollTrigger } = gsapModules;
        const ctx = gsap.context(() => {
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
        }, stickySectionRef);

        return () => ctx.revert();
    }, [isLoading, gsapModules]);

    return (
        <>
        <section
            ref={wrapperRef}
            className="Horizontal"
            aria-label="What we do"
        >
            {/* Y2K icons background - fills section, no white space (from y2k icons, not parallax) */}
            <div className="Horizontal__bg" aria-hidden>
                {Y2K_IMAGES.flatMap((src, i) =>
                    Array.from({ length: 24 }, (_, j) => (
                        <div key={`${i}-${j}`} className="Horizontal__bg-icon">
                            <img src={src} alt="" loading="lazy" />
                        </div>
                    ))
                )}
            </div>

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

        {/* Highlights / Explore Events section */}
        <div ref={highlightsRef} className="section_contain u-section u-zindex-3">
            <div
                data-wf--spacer--section-space="large"
                className="u-section-spacer w-variant-8cc18b30-4618-8767-0111-f6abfe45aaa3 u-ignore-trim"
            />
            <div className="u-container">
                <div className="u-grid-custom">
                    <div className="about_heading u-column-8">
                        <div
                            data-wf--button-main--style="primary"
                            className="button_main_wrap u-margin-bottom-6"
                            data-button=" "
                        >
                            <div className="clickable_wrap u-cover-absolute">
                                <a target="" href="/events" className="clickable_link w-inline-block">
                                    <span className="clickable_text u-sr-only">[ Explore Events ]</span>
                                </a>
                            </div>
                            <div aria-hidden="true" className="button_main_text u-text-style-main">
                                [ Explore Events ]
                            </div>
                            <div className="button_bg" />
                        </div>
                        <h2 className="u-text-style-h2 u-margin-bottom-6">Highlights</h2>
                    </div>
                </div>
                <div data-swiper-wrap="" className="home_work_component w-dyn-list">
                    <div ref={worksGridRef} role="list" className="home_work_grid u-grid-custom w-dyn-items">
                        {PROJECTS.map((project) => (
                            <div
                                key={project.slug}
                                role="listitem"
                                className="home_work_item u-column-3 w-dyn-item"
                            >
                                <a href="/events" className="work_item w-inline-block">
                                    <div className="work_image_wrap">
                                        <img
                                            loading="lazy"
                                            src={project.image}
                                            alt={project.title}
                                            sizes="(max-width: 479px) 88vw, (max-width: 767px) 82vw, (max-width: 991px) 45vw, 25vw"
                                            className="u-cover-absolute"
                                        />
                                    </div>
                                    <div className="work_item_info">
                                        <div>
                                            <div className="work_info_wrap">
                                                <div>{project.year}</div>
                                                <div>{project.category}</div>
                                            </div>
                                            <div>
                                                <div className="cs_client u-text-style-large u-text-trim-off">
                                                    {project.title}
                                                </div>
                                                <div className="cs_title u-text-trim-off">{project.client}</div>
                                            </div>
                                        </div>
                                        <div className="cs_btn_wrap">
                                            <div className="cs_btn_text">View Event</div>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="100%"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="u-icon-medium u-zindex-1"
                                            >
                                                <path
                                                    fill="currentColor"
                                                    d="m13.895 16.5-1.056-1.06 2.677-2.69H5.625v-1.5h9.892l-2.678-2.69 1.056-1.06 4.48 4.5-4.48 4.5Z"
                                                />
                                            </svg>
                                            <div className="cs_btn_bg" />
                                        </div>
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="u-alignment-center u-margin-top-5">
                    <div
                        data-wf--button-main--style="primary"
                        className="button_main_wrap"
                        data-button=" "
                    >
                        <div className="clickable_wrap u-cover-absolute">
                            <a target="" href="/events" className="clickable_link w-inline-block">
                                <span className="clickable_text u-sr-only">[ All Events ]</span>
                            </a>
                        </div>
                        <div aria-hidden="true" className="button_main_text u-text-style-main">
                            [ All Events ]
                        </div>
                        <div className="button_bg" />
                    </div>
                </div>
            </div>
            <div
                data-wf--spacer--section-space="main"
                className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
            />
        </div>

        {/* Sticky card section */}
        <div ref={stickySectionRef} className="services-works-section u-section" data-wf--section--theme="inherit">
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
                                    <div className="services_number_wrap u-column-1">
                                        <div className="u-opacity-60">{service.number}</div>
                                    </div>
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
            <div
                data-wf--spacer--section-space="main"
                className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
            />
        </div>
        </>
    );
}
