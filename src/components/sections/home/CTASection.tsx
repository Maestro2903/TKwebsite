'use client';

import React, { useState, useEffect, useRef } from 'react';
import ParallaxFloatingImages from '@/components/ui/parallax-floating-images';

const Y2K_IMAGES = [
    '/assets/y2k-icons/AI_generated_3D_star_icon_created_from_metallic_chrome_liquid_material_PNG-removebg-preview.png',
    '/assets/y2k-icons/CHROMESTARS-removebg-preview.png',
    '/assets/y2k-icons/Download_premium_png_of_Human_skull_png_icon_sticker__3D_rendering__transparent-removebg-preview.png',
    '/assets/y2k-icons/Holographic_Vinyl-removebg-preview.png',
    '/assets/y2k-icons/Silver_3D_Polaris-removebg-preview.png',
    '/assets/y2k-icons/_chrome_stars__Sticker_for_Sale_by_metallirakas-removebg-preview.png',
    '/assets/y2k-icons/download__2_-removebg-preview (1).png',
    '/assets/y2k-icons/download__2_-removebg-preview.png',
    '/assets/y2k-icons/download__3_-removebg-preview.png',
    '/assets/y2k-icons/pic_is_not_mine_-removebg-preview.png',
];

export default function CTASection() {
    const sectionRef = useRef<HTMLElement>(null);

    return (
        <section ref={sectionRef} id="section_cta" className="section_cta u-section" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Background Flame */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
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

            {/* Scattered Images */}
            <ParallaxFloatingImages
                images={Y2K_IMAGES}
                className="z-10"
            />

            {/* Text Content */}
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
