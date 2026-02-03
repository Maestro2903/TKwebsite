'use client';

import React, { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SplineErrorBoundary } from './SplineWithFallback';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
    ssr: false,
    loading: () => <div className="_3d_absolute hide-mobile" style={{ background: 'transparent' }} />,
});

const CTA_VIDEO_SRC = '/videos/3d-zeit.mp4';

const splineFallback = (
    <video
        src={CTA_VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        className="_3d_absolute hide-mobile"
        style={{ objectFit: 'cover' }}
    />
);

/** Match hide-mobile / _3d_absolute_mobile breakpoint: only one video decode (desktop = Spline or fallback; mobile = single video). */
const MOBILE_QUERY = '(max-width: 767px)';

export default function CTASection() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mql = window.matchMedia(MOBILE_QUERY);
        const update = () => setIsMobile(mql.matches);
        update();
        mql.addEventListener('change', update);
        return () => mql.removeEventListener('change', update);
    }, []);

    return (
        <section id="section_cta" className="section_cta u-section">
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
                    <SplineErrorBoundary fallback={splineFallback}>
                        <Suspense fallback={<div className="_3d_absolute hide-mobile" style={{ background: 'transparent' }} />}>
                            <Spline
                                scene="/assets/spline/scene.splinecode"
                                className="_3d_absolute hide-mobile"
                            />
                        </Suspense>
                    </SplineErrorBoundary>
                    {isMobile && (
                        <video
                            src={CTA_VIDEO_SRC}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="_3d_absolute_mobile"
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
