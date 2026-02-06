'use client';

import React from 'react';
import Image from 'next/image';
import GlowingDotsGrid from '@/components/decorative/GlowingDotsGrid';

export default function CTASection() {
    return (
        <section
            id="section_cta"
            className="section_cta u-section relative"
            style={{
                minHeight: '100vh',
                position: 'relative',
                overflow: 'hidden',
                background: '#0a0a0a'
            }}
        >
            {/* Interactive Dots Grid Background */}
            <GlowingDotsGrid />

            {/* Logo at the top center */}
            <div
                className="absolute left-1/2 top-20 z-10 grid -translate-x-1/2 content-start justify-items-center gap-6"
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
        </section>
    );
}
