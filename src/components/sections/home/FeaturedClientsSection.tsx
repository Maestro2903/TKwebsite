'use client';

import { useRef } from 'react';
import Image from 'next/image';

import { Y2K_IMAGES } from '@/data/y2k-images';
import ParallaxFloatingImages from '@/components/ui/parallax-floating-images';

export default function FeaturedClientsSection() {
    const sectionRef = useRef<HTMLElement>(null);

    return (
        <div style={{ position: 'relative' }}>
            <ParallaxFloatingImages images={Y2K_IMAGES} className="z-0" />
            <section ref={sectionRef} className="section_home_client section_wrap cit_section relative z-10">
                <div className="featured_client_component cit_about_component">
                    <div className="cit_about_contain u-container">
                        <div className="cit_about_grid">
                            <div className="cit_about_content">
                                <h2 className="cit_about_heading">CIT</h2>

                                <div className="cit_about_body">
                                    <p>
                                        A prominent institution ranking amongst the top colleges in Tamil Nadu, was established with an initiative to provide pragmatic learning. The institution has also partnered with a number of companies to set a worldwide standard by offering students a diverse range of possibilities that combine education and recreation.
                                    </p>
                                    <p>
                                        The students&apos; appetite for knowledge makes them thrive to prepare for the ready-to-serve industrial requirements. This is delivered by CIT through professional ethics which is sated by frequent guest lectures by professionals from various industries and academic backgrounds. Chennai Institute of Technology has been awarded the National Award of Excellence for Best Placements &amp; has been ranked Second in Tamil Nadu. Our college has made dreams of thousands of students come true.
                                    </p>
                                </div>

                                <blockquote className="cit_quote_block">
                                    <p className="cit_quote_text">
                                        &ldquo;Our objective for establishing CIT is to transfer our knowledge to you, so that you can transform into a proper engineer&rdquo;
                                    </p>
                                    <footer className="cit_quote_attribution">
                                        ~ Shri Sriram Parthasarathy
                                    </footer>
                                </blockquote>
                            </div>

                            <div className="cit_about_image_wrap">
                                <Image
                                    src="/images/about/chairman.jpeg"
                                    alt="CIT - Chennai Institute of Technology"
                                    fill
                                    loading="lazy"
                                    className="cit_about_image"
                                    sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 440px"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
