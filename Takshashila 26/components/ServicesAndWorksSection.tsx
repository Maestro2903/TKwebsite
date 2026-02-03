'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Flagship events - Takshashila
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

// Combined Services and Works Section - matches original HTML structure (lines 1995-2383)
export default function ServicesAndWorksSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const worksHeadingRef = useRef<HTMLHeadingElement>(null);
    const worksGridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
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
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            }

            // Works heading animation
            if (worksHeadingRef.current) {
                gsap.fromTo(
                    worksHeadingRef.current,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: worksHeadingRef.current,
                            start: 'top 80%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            }

            // Works items stagger animation
            if (worksGridRef.current) {
                const workItems = worksGridRef.current.querySelectorAll('.home_work_item');
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
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={sectionRef} data-wf--section--theme="inherit" className="u-section services-works-section">
            {/* Spacer */}
            <div
                data-wf--spacer--section-space="main"
                className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
            />

            {/* Part 1: "What we do" Header */}
            <div className="section_contain">
                <div className="u-container u-grid-custom">
                    <div className="about_heading u-column-8">
                        <h2
                            ref={headingRef}
                            data-heading="heading-animation"
                            className="u-text-style-h2 u-margin-bottom-8"
                        >
                            We curate an exhilarating journey of technical challenges, creative arts, and musical extravaganzas fished straight out of the ocean.
                        </h2>
                        <div
                            data-wf--button-main--style="primary"
                            className="button_main_wrap"
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
                    </div>
                </div>

                {/* Part 2: Works Grid - Nested */}
                <div className="u-section u-zindex-3">
                    <div
                        data-wf--spacer--section-space="large"
                        className="u-section-spacer w-variant-8cc18b30-4618-8767-0111-f6abfe45aaa3 u-ignore-trim"
                    />
                    <div data-swiper-group="" className="u-container">
                        <div>
                            <h2
                                ref={worksHeadingRef}
                                data-heading="heading-animation"
                                className="u-text-style-h2 u-margin-bottom-6"
                            >
                                Highlights
                            </h2>
                        </div>

                        {/* Works Grid */}
                        <div data-swiper-wrap="" className="home_work_component w-dyn-list">
                            <div ref={worksGridRef} role="list" className="home_work_grid u-grid-custom w-dyn-items">
                                {PROJECTS.map((project) => (
                                    <div
                                        key={project.slug}
                                        role="listitem"
                                        className="home_work_item u-column-3 w-dyn-item"
                                    >
                                        <a href={`/events`} className="work_item w-inline-block">
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

                        {/* All Projects Button */}
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

                {/* Spacer */}
                <div
                    data-wf--spacer--section-space="main"
                    className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
                />

                {/* Part 3: Service Cards */}
                <div data-wf--content-wrapper--alignment="inherit" className="u-display-contents">
                    <div className="u-content-wrapper u-zindex-3 u-container">
                        {SERVICES.map((service, index) => (
                            <div key={service.number} data-home-service="" className="sticky-card-wrap" style={{ zIndex: 10 + index }}>
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
            </div>

            {/* Final Spacer */}
            <div data-wf--spacer--section-space="none" className="u-section-spacer u-ignore-trim" />
        </div>
    );
}
