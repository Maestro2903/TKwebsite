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

// Exact HTML structure from original Zeit Media website for Works Section
export default function WorksSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

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

            // Card stagger animation
            cardsRef.current.forEach((card, i) => {
                if (card) {
                    gsap.fromTo(
                        card,
                        { opacity: 0, y: 60 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.8,
                            delay: i * 0.1,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: card,
                                start: 'top 90%',
                                toggleActions: 'play none none reverse',
                            },
                        }
                    );
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="u-section u-zindex-3">
            <div
                data-wf--spacer--section-space="large"
                className="u-section-spacer w-variant-8cc18b30-4618-8767-0111-f6abfe45aaa3 u-ignore-trim"
            />
            <div data-swiper-group="" className="u-container">
                <div>
                    <div className="eyebrow_wrap u-margin-bottom-4">
                        <div className="eyebrow_layout">
                            <div className="eyebrow_marker" />
                            <div className="eyebrow_text u-text-style-main w-richtext">
                                <p>Flagship Events</p>
                            </div>
                        </div>
                    </div>
                    <h2
                        ref={headingRef}
                        data-heading="heading-animation"
                        className="u-text-style-h2 u-margin-bottom-6"
                    >
                        Highlights
                    </h2>
                </div>
                <div data-swiper-wrap="" className="home_work_component w-dyn-list">
                    <div role="list" className="home_work_grid u-grid-custom w-dyn-items">
                        {PROJECTS.map((project, index) => (
                            <div
                                key={project.slug}
                                ref={(el) => { cardsRef.current[index] = el; }}
                                role="listitem"
                                className="home_work_item u-column-3 w-dyn-item"
                            >
                                <a href={`/work/${project.slug}`} className="work_item w-inline-block">
                                    <div className="work_image_wrap">
                                        <img
                                            loading="lazy"
                                            src={project.image}
                                            alt={project.title}
                                            sizes="100vw"
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
                                            <div className="cs_btn_text">View Case</div>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="100%"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="u-icon-medium u-zindex-1"
                                            >
                                                <path
                                                    fill="#000"
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
                            <a target="" href="/works" className="clickable_link w-inline-block">
                                <span className="clickable_text u-sr-only">[ All Projects ]</span>
                            </a>
                            <button type="button" className="clickable_btn">
                                <span className="clickable_text u-sr-only">[ All Projects ]</span>
                            </button>
                        </div>
                        <div aria-hidden="true" className="button_main_text u-text-style-main">
                            [ All Projects ]
                        </div>
                        <div className="button_bg" />
                    </div>
                </div>
            </div>
            <div
                data-wf--spacer--section-space="main"
                className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
            />
        </section>
    );
}
