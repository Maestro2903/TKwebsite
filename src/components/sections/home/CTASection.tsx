'use client';

import React, { useRef } from 'react';
import ParallaxFloatingImages from '@/components/ui/parallax-floating-images';

const CTA_PARALLAX_IMAGES = [
    '/assets/y2k-icons/CHROMESTARS-removebg-preview.webp',
    '/assets/y2k-icons/AI_generated_3D_star_icon_created_from_metallic_chrome_liquid_material_PNG-removebg-preview.webp',
    '/assets/y2k-icons/Holographic_Vinyl-removebg-preview.webp',
    '/assets/y2k-icons/Silver_3D_Polaris-removebg-preview.webp',
    '/assets/y2k-icons/Download_premium_png_of_Human_skull_png_icon_sticker__3D_rendering__transparent-removebg-preview.webp',
    '/assets/y2k-icons/_chrome_stars__Sticker_for_Sale_by_metallirakas-removebg-preview.webp',
    '/assets/y2k-icons/download__2_-removebg-preview.webp',
    '/assets/y2k-icons/download__3_-removebg-preview.webp',
    '/assets/y2k-icons/download__2_-removebg-preview (1).webp',
    '/assets/y2k-icons/pic_is_not_mine_-removebg-preview.webp',
];

export default function CTASection() {
    const sectionRef = useRef<HTMLElement>(null);

    return (
        <section ref={sectionRef} id="section_cta" className="section_cta u-section" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Background: Parallax Floating Images */}
            <ParallaxFloatingImages images={CTA_PARALLAX_IMAGES} mode="section" className="z-0" />

            {/* Mid: Flame image */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <img
                    src="/assets/flame-bg.webp"
                    alt=""
                    width={1200}
                    height={800}
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

