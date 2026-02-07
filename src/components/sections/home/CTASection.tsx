'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
                variant="blue"
                className="!absolute inset-0 !w-full !h-full !min-h-screen !max-w-none !rounded-none !border-0 !aspect-auto"
            >
                {/* Content wrapper: above canvas + ::before, vertically centered */}
                <div
                    className="cta-section__content absolute inset-0 flex flex-col items-center justify-center gap-8 pointer-events-none w-full max-w-[90%] text-center z-10"
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
                    {/* CTA content - pointer-events-auto so button is clickable */}
                    <div className="grid content-start justify-items-center gap-6 pointer-events-auto">
                        <p className="cta-section__tagline text-lg md:text-xl font-medium text-white/95 tracking-wide max-w-md">
                            Join us for a celebration of technology and culture.
                        </p>
                        <div
                            data-wf--button-main--style="primary"
                            className="button_main_wrap cta-section__btn"
                            data-button=" "
                        >
                            <div className="clickable_wrap u-cover-absolute">
                                <Link
                                    href="/register"
                                    className="clickable_link w-inline-block"
                                >
                                    <span className="clickable_text u-sr-only">
                                        Get your pass
                                    </span>
                                </Link>
                                <button type="button" className="clickable_btn">
                                    <span className="clickable_text u-sr-only">
                                        Get your pass
                                    </span>
                                </button>
                            </div>
                            <div
                                aria-hidden="true"
                                className="button_main_text u-text-style-main"
                            >
                                Get your pass
                            </div>
                            <div className="button_bg" />
                        </div>
                    </div>
                </div>
            </PixelCard>
        </section>
    );
}

