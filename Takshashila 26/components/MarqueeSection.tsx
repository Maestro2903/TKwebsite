'use client';

import { useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';

/** Optimized video: preload=metadata (saves RAM), pauses when off-screen, centered */
function ScalingVideo() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        video.play().catch(() => {});
                    } else {
                        video.pause();
                    }
                });
            },
            { rootMargin: '50px', threshold: 0 }
        );
        io.observe(video);
        return () => io.disconnect();
    }, []);

    return (
        <video
            ref={videoRef}
            src="/videos/cover-final-2.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="scaling-video__element u-zindex-1"
        />
    );
}

// Local assets - memoized to prevent re-renders
const IMAGE_URLS = {
    rect38: '/assets/marquee/rectangle38.avif',
    main: '/assets/marquee/main.avif',
    image1113: '/assets/marquee/image1113.avif',
    haniff: '/assets/marquee/haniff1.avif',
} as const;

export default function MarqueeSection() {
    return (
        <section className="u-section u-zindex-2" style={{ overflow: 'hidden' }}>
            <div
                data-wf--spacer--section-space="small"
                className="u-section-spacer w-variant-d422cbd0-f212-c815-68df-63414354c21d u-ignore-trim"
            />

            {/* Row 1 - Scrolls Right */}
            <div
                data-marquee-direction="right"
                className="marquee-advanced is-bts-1"
            >
                <div data-marquee-scroll-target="" className="marquee-advanced__scroll">
                    {/* Collection 1 */}
                    <div data-marquee-collection-target="" className="marquee-advanced__collection">
                        <p className="marquee__advanced__p">Dive Deep.</p>
                        <div className="home_marquee_image_wrap">
                            <img
                                width={160}
                                loading="eager"
                                alt=""
                                src={IMAGE_URLS.rect38}
                                className="u-cover-absolute"
                            />
                        </div>
                        <p className="marquee__advanced__p">Rise High.</p>
                        <div className="home_marquee_image_wrap">
                            <img
                                width={160}
                                loading="eager"
                                alt=""
                                src={IMAGE_URLS.main}
                                sizes="160px"
                                className="u-cover-absolute"
                            />
                        </div>
                    </div>
                    {/* Collection 1 Duplicate for infinite scroll */}
                    <div data-marquee-collection-target="" className="marquee-advanced__collection">
                        <p className="marquee__advanced__p">Dive Deep.</p>
                        <div className="home_marquee_image_wrap">
                            <Image
                                width={160}
                                height={160}
                                loading="lazy"
                                alt=""
                                src={IMAGE_URLS.rect38}
                                className="u-cover-absolute"
                                sizes="160px"
                            />
                        </div>
                        <p className="marquee__advanced__p">Rise High.</p>
                        <div className="home_marquee_image_wrap">
                            <Image
                                width={160}
                                height={160}
                                loading="lazy"
                                alt=""
                                src={IMAGE_URLS.main}
                                sizes="160px"
                                className="u-cover-absolute"
                            />
                        </div>
                    </div>
                    {/* Collection 1 Second Duplicate for safety on wide screens */}
                    <div data-marquee-collection-target="" className="marquee-advanced__collection">
                        <p className="marquee__advanced__p">Dive Deep.</p>
                        <div className="home_marquee_image_wrap">
                            <Image
                                width={160}
                                height={160}
                                loading="lazy"
                                alt=""
                                src={IMAGE_URLS.rect38}
                                className="u-cover-absolute"
                                sizes="160px"
                            />
                        </div>
                        <p className="marquee__advanced__p">Rise High.</p>
                        <div className="home_marquee_image_wrap">
                            <Image
                                width={160}
                                height={160}
                                loading="lazy"
                                alt=""
                                src={IMAGE_URLS.main}
                                sizes="160px"
                                className="u-cover-absolute"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2 - Scrolls Left */}
            <div
                data-marquee-direction="left"
                className="marquee-advanced is-bts-2"
            >
                <div data-marquee-scroll-target="" className="marquee-advanced__scroll u-text-trim-off">
                    {/* Collection 2 */}
                    <div data-marquee-collection-target="" className="marquee-advanced__collection">
                        <p className="marquee__advanced__p">The Voyage Begins.</p>
                        <div className="home_marquee_image_wrap">
                            <img
                                width={160}
                                loading="eager"
                                alt=""
                                src={IMAGE_URLS.image1113}
                                className="u-cover-absolute"
                            />
                        </div>
                        <p className="marquee__advanced__p">That&apos;s the Takshashila Spirit.</p>
                        <div className="home_marquee_image_wrap">
                            <img
                                width={160}
                                loading="eager"
                                alt=""
                                src={IMAGE_URLS.haniff}
                                sizes="160px"
                                className="u-cover-absolute"
                            />
                        </div>
                    </div>
                    {/* Collection 2 Duplicate */}
                    <div data-marquee-collection-target="" className="marquee-advanced__collection">
                        <p className="marquee__advanced__p">The Voyage Begins.</p>
                        <div className="home_marquee_image_wrap">
                            <Image
                                width={160}
                                height={160}
                                loading="lazy"
                                alt=""
                                src={IMAGE_URLS.image1113}
                                className="u-cover-absolute"
                                sizes="160px"
                            />
                        </div>
                        <p className="marquee__advanced__p">That&apos;s the Takshashila Spirit.</p>
                        <div className="home_marquee_image_wrap">
                            <Image
                                width={160}
                                height={160}
                                loading="lazy"
                                alt=""
                                src={IMAGE_URLS.haniff}
                                sizes="160px"
                                className="u-cover-absolute"
                            />
                        </div>
                    </div>
                    {/* Collection 2 Second Duplicate */}
                    <div data-marquee-collection-target="" className="marquee-advanced__collection">
                        <p className="marquee__advanced__p">The Voyage Begins.</p>
                        <div className="home_marquee_image_wrap">
                            <Image
                                width={160}
                                height={160}
                                loading="lazy"
                                alt=""
                                src={IMAGE_URLS.image1113}
                                className="u-cover-absolute"
                                sizes="160px"
                            />
                        </div>
                        <p className="marquee__advanced__p">That&apos;s the Takshashila Spirit.</p>
                        <div className="home_marquee_image_wrap">
                            <Image
                                width={160}
                                height={160}
                                loading="lazy"
                                alt=""
                                src={IMAGE_URLS.haniff}
                                sizes="160px"
                                className="u-cover-absolute"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Scaling Video Small Box */}
            <div className="scaling-element__small-box">
                <div
                    data-flip-id="scaling-video"
                    className="scaling-video__wrapper"
                >
                    <div className="scaling-video">
                        <ScalingVideo />
                        <div className="scaling-video-overlay" />
                    </div>
                </div>
            </div>

            <div
                data-wf--spacer--section-space="small"
                className="u-section-spacer w-variant-d422cbd0-f212-c815-68df-63414354c21d u-ignore-trim"
            />
        </section>
    );
}
