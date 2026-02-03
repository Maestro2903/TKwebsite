import { useRef, useLayoutEffect } from 'react';
import { useGSAP } from '@/hooks/useGSAP';

export default function ScalingVideoSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const textElements = useRef<HTMLDivElement[]>([]);
    const buttonRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [gsapModules, isLoading] = useGSAP(true); // Load Flip module

    useLayoutEffect(() => {
        if (isLoading || !gsapModules) return;

        const { gsap, ScrollTrigger, Flip } = gsapModules;
        let flipCtx: ReturnType<typeof gsap.context>;

        const initFlip = () => {
            // Get the video wrapper from the previous section (MarqueeSection)
            const videoWrapper = document.querySelector('[data-flip-id="scaling-video"]');

            // If the element doesn't exist yet, retry shortly (React hydration timing)
            if (!videoWrapper || !wrapperRef.current || !Flip) {
                // If we can't find the element, we might need to wait for the other component to mount
                return;
            }

            flipCtx = gsap.context(() => {
                // Determine the "state" of the element in its starting position (in MarqueeSection)
                const state = Flip.getState(videoWrapper);

                // Re-parent the element to the new container in this section
                wrapperRef.current!.appendChild(videoWrapper);

                // Create the Flip animation
                Flip.from(state, {
                    // We don't want to animate immediately, we want to scrub it with scroll
                    duration: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top bottom", // Start when top of section hits bottom of viewport
                        end: "top top",     // End when top of section hits top of viewport
                        scrub: true,
                    }
                });

                // Animate text elements (unchanged logic)
                textElements.current.forEach((el, i) => {
                    if (el) {
                        gsap.fromTo(
                            el,
                            { y: 100, opacity: 0 },
                            {
                                y: 0,
                                opacity: 1,
                                duration: 1,
                                delay: i * 0.1,
                                ease: 'power3.out',
                                scrollTrigger: {
                                    trigger: sectionRef.current,
                                    start: 'top 70%',
                                    end: 'top 30%',
                                    toggleActions: 'play none none reverse',
                                },
                            }
                        );
                    }
                });

                // Animate button (unchanged logic)
                if (buttonRef.current) {
                    gsap.fromTo(
                        buttonRef.current,
                        { y: 50, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.8,
                            delay: 0.6,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: sectionRef.current,
                                start: 'top 50%',
                                end: 'top 20%',
                                toggleActions: 'play none none reverse',
                            },
                        }
                    );
                }
            }, sectionRef);
        };

        // Small timeout to ensure DOM is ready across components
        const timer = setTimeout(initFlip, 100);

        return () => {
            clearTimeout(timer);
            if (flipCtx) flipCtx.revert();

            // Optional: Logic to put the element back if unmounting, 
            // but for a single page scroll flow, simple reversion by GSAP context is usually enough 
            // if we are navigating away. If we just scroll up, Flip handles the "scrub" backwards automatically.
        };
    }, [isLoading, gsapModules]);

    const addToRefs = (el: HTMLDivElement | null) => {
        if (el && !textElements.current.includes(el)) {
            textElements.current.push(el);
        }
    };

    return (
        <section ref={sectionRef} className="section_scale u-section">
            <div className="scaling-element__big-box">
                {/* 
                    This wrapper receives the video element from MarqueeSection 
                    via GSAP Flip reparenting.
                */}
                <div ref={wrapperRef} className="scaling-video__placeholder" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />

                <div className="scaling-video__before" />
                <div className="scailing_text_wrap">
                    <div className="scailing_text_contain u-container">
                        {/* Row 1: Ready to Dive */}
                        <div className="_3d_heading_wrap is-1">
                            <div className="u-overflow-clip">
                                <div
                                    ref={addToRefs}
                                    data-scailing-text=""
                                    className="scailing_text"
                                >
                                    Ready to
                                </div>
                            </div>
                            <div className="u-overflow-clip">
                                <div
                                    ref={addToRefs}
                                    data-scailing-text=""
                                    className="scailing_text"
                                >
                                    Dive
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Into The */}
                        <div className="_3d_heading_wrap is-2">
                            <div className="u-overflow-clip">
                                <div
                                    ref={addToRefs}
                                    data-scailing-text=""
                                    className="scailing_text"
                                >
                                    Into The
                                </div>
                            </div>
                            <div className="u-overflow-clip">
                                <div
                                    ref={addToRefs}
                                    data-scailing-text=""
                                    className="scailing_text"
                                >
                                    Rhythm
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Of Life? */}
                        <div className="_3d_heading_wrap is-last">
                            <div className="u-overflow-clip">
                                <div
                                    ref={addToRefs}
                                    data-scailing-text=""
                                    className="scailing_text"
                                >
                                    Of Life?
                                </div>
                            </div>
                        </div>

                        {/* Contact Button */}
                        <div className="scailing_button_wrap u-grid-custom">
                            <div
                                ref={buttonRef}
                                data-scailing-btn=""
                                id="w-node-_0185ad54-065e-4911-0e87-697f59a034b1-59a03498"
                                className="scailing_button u-column-6"
                            >
                                <div
                                    data-wf--button-main--style="primary"
                                    className="button_main_wrap"
                                    data-button=" "
                                >
                                    <div className="clickable_wrap u-cover-absolute">
                                        <a
                                            target=""
                                            href="/register"
                                            className="clickable_link w-inline-block"
                                        >
                                            <span className="clickable_text u-sr-only">
                                                [ Get Gate Pass ]
                                            </span>
                                        </a>
                                        <button type="button" className="clickable_btn">
                                            <span className="clickable_text u-sr-only">
                                                [ Get Gate Pass ]
                                            </span>
                                        </button>
                                    </div>
                                    <div
                                        aria-hidden="true"
                                        className="button_main_text u-text-style-main"
                                    >
                                        [ Get Gate Pass ]
                                    </div>
                                    <div className="button_bg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
