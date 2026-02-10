'use client';

import React, { useRef } from 'react';
import CanvasSpiral from '@/components/ui/CanvasSpiral';

export default function CTASection() {
    const sectionRef = useRef<HTMLElement>(null);

    return (
        <section ref={sectionRef} id="section_cta" className="section_cta u-section" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Background: Canvas Spiral Animation */}
            <CanvasSpiral className="z-0" />

            {/* Mid: Flame image */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <img
                    src="/assets/flame-bg.png"
                    alt=""
                    className="opacity-60 mix-blend-screen object-cover"
                    style={{
                        width: '85%',
                        maxWidth: 'none',
                        height: 'auto',
                    }}
                />
            </div>

            {/* Front: Text Content */}
            <div className="cta_wrap u-container relative z-20 flex flex-col justify-center items-center h-full pointer-events-none" style={{ transform: 'scale(0.85)' }}>
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
        </section>
    );
}

