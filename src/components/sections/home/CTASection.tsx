'use client';

import React from 'react';
import Image from 'next/image';
import ImageCursorTrail from '@/components/ui/image-cursor-trail';

const images = [
    "/images/y2k/AI_generated_3D_star_icon_created_from_metallic_chrome_liquid_material_PNG-removebg-preview.png",
    "/images/y2k/CHROMESTARS-removebg-preview.png",
    "/images/y2k/Download_premium_png_of_Human_skull_png_icon_sticker__3D_rendering__transparent-removebg-preview.png",
    "/images/y2k/Holographic_Vinyl-removebg-preview.png",
    "/images/y2k/Silver_3D_Polaris-removebg-preview.png",
    "/images/y2k/_chrome_stars__Sticker_for_Sale_by_metallirakas-removebg-preview.png",
    "/images/y2k/download__2_-removebg-preview (1).png",
    "/images/y2k/download__2_-removebg-preview.png",
    "/images/y2k/download__3_-removebg-preview.png",
    "/images/y2k/pic_is_not_mine_-removebg-preview.png",
];

export default function CTASection() {
    return (
        <section
            id="section_cta"
            className="section_cta u-section relative w-full overflow-hidden bg-black"
            style={{
                minHeight: '100vh',
                position: 'relative',
            }}
        >
            <ImageCursorTrail
                items={images}
                maxNumberOfImages={5}
                distance={25}
                imgClass="w-auto h-auto max-w-[100px] max-h-[100px] object-contain"
                className="w-full h-full min-h-screen"
            >
                {/* Logo at the top center */}
                <div
                    className="absolute left-1/2 top-20 z-10 grid -translate-x-1/2 content-start justify-items-center gap-6 pointer-events-none"
                    style={{
                        textAlign: 'center',
                        maxWidth: '90%'
                    }}
                >
                    <Image
                        src="/tk-26-logo-final.png"
                        alt="Takshashika 26"
                        width={800}
                        height={400}
                        priority
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
                        }}
                    />
                </div>
            </ImageCursorTrail>
        </section>
    );
}

