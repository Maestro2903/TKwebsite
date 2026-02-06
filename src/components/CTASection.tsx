'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import GlowingDotsGrid from '@/components/decorative/GlowingDotsGrid';

const CTAGlbViewer = dynamic(() => import('@/components/decorative/CTAGlbViewer'), {
    ssr: false,
    loading: () => <div className="_3d_absolute hide-mobile" style={{ background: 'transparent' }} />,
});

const CTA_VIDEO_SRC = '/videos/3d-zeit-optimized.mp4';

/** Match hide-mobile / _3d_absolute_mobile breakpoint: only one video decode (desktop = Spline or fallback; mobile = single video). */
const MOBILE_QUERY = '(max-width: 767px)';

export default function CTASection() {
    const [isMobile, setIsMobile] = useState(false);
    const [ctaInView, setCtaInView] = useState(false);
    const [shouldLoadMobileVideo, setShouldLoadMobileVideo] = useState(false);
    const [wants3D, setWants3D] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mql = window.matchMedia(MOBILE_QUERY);
        const update = () => setIsMobile(mql.matches);
        update();
        mql.addEventListener('change', update);
        return () => mql.removeEventListener('change', update);
    }, []);

    // Mark CTA as in-view (used to gate media loading)
    useEffect(() => {
        if (ctaInView || typeof window === 'undefined' || !sectionRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setCtaInView(true);
                        setShouldLoadMobileVideo(true);
                        observer.disconnect();
                    }
                });
            },
            { rootMargin: '200px' } // Start loading 200px before entering viewport
        );

        observer.observe(sectionRef.current);

        return () => observer.disconnect();
    }, [ctaInView]);

    return (
        <section ref={sectionRef} id="section_cta" className="section_cta u-section">
            {/* Interactive Dots Grid Background */}
            {ctaInView && <GlowingDotsGrid />}

            <div className="cta_wrap u-container">
                <div className="_3d_heading_wrap">
                    <div className="_3d_heading">Let&apos;s</div>
                    <div className="_3d_heading">Embark</div>
                </div>
                <div className="_3d_heading_wrap">
                    <div className="_3d_heading">On The</div>
                </div>
                <div className="_3d_heading_wrap is-last">
                    <div className="_3d_heading">Voyage</div>
                </div>
            </div>
            <div className="_3d_wrap">
                <div className="_3d_canvas">
                    {/* Desktop: remove 3D from initial load; only enable after user intent */}
                    {wants3D && ctaInView && !isMobile ? (
                        <Suspense fallback={<div className="_3d_absolute hide-mobile" style={{ background: 'transparent' }} />}>
                            <CTAGlbViewer />
                        </Suspense>
                    ) : !isMobile ? (
                        <div className="_3d_absolute hide-mobile" style={{ background: 'transparent' }} />
                    ) : null}
                    {!isMobile && !wants3D && (
                        <button
                            type="button"
                            onClick={() => setWants3D(true)}
                            className="_3d_absolute hide-mobile"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'inherit',
                            }}
                            aria-label="Enable 3D effect"
                        />
                    )}
                    {isMobile && (
                        <video
                            src={shouldLoadMobileVideo ? CTA_VIDEO_SRC : undefined}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload={shouldLoadMobileVideo ? 'metadata' : 'none'}
                            poster="/assets/images/cta-poster.webp"
                            className="_3d_absolute_mobile"
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
