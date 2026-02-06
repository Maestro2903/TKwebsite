'use client';

import React from 'react';
import Image from 'next/image';
import PixelCard from '@/components/ui/PixelCard';

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
            <PixelCard
                variant="pink"
                className="!absolute inset-0 !w-full !h-full !min-h-screen !max-w-none !rounded-none !border-0 !aspect-auto"
            >
                {/* Logo at the top center - position absolute per PixelCard usage */}
                <div
                    className="absolute left-1/2 top-20 -translate-x-1/2 grid content-start justify-items-center gap-6 pointer-events-none"
                    style={{
                        textAlign: 'center',
                        maxWidth: '90%',
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
                            filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))',
                        }}
                    />
                </div>
            </PixelCard>
        </section>
    );
}

