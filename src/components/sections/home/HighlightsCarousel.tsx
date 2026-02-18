'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useGSAP } from '@/hooks/useGSAP';

interface HighlightsCarouselProps {
    images: Array<{ src: string; alt: string }>;
}

export default function HighlightsCarousel({ images }: HighlightsCarouselProps) {
    const sliderRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const [gsapModules, isLoading] = useGSAP();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (isLoading || !gsapModules || !listRef.current || !sliderRef.current) return;

        const { gsap } = gsapModules;
        let cleanup: (() => void) | undefined;
        let loop: any;

        // Small delay to ensure DOM is ready
        const initTimer = setTimeout(() => {
            // Dynamically import Draggable and InertiaPlugin
            Promise.all([
                import('gsap/Draggable'),
                import('gsap/InertiaPlugin'),
            ]).then(([DraggableModule, InertiaModule]) => {
            const Draggable = (DraggableModule as any).Draggable || (DraggableModule as any).default;
            const InertiaPlugin = (InertiaModule as any).InertiaPlugin || (InertiaModule as any).default;

            if (!Draggable) {
                console.warn('Draggable not available');
                return;
            }

            gsap.registerPlugin(Draggable);
            if (InertiaPlugin) {
                gsap.registerPlugin(InertiaPlugin);
            }

            const listElement = listRef.current;
            if (!listElement) return;

            const slides = gsap.utils.toArray<HTMLElement>('[data-slider="slide"]', listElement);
            if (slides.length === 0) {
                console.warn('No slides found');
                return;
            }

            // Wait for images to load before initializing
            if (!listRef.current) return;
            const images = listRef.current.querySelectorAll('img');
            const imagePromises = Array.from(images).map((img) => {
                if (img.complete) return Promise.resolve();
                return new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve; // Continue even if image fails
                });
            });

            Promise.all(imagePromises).then(() => {
                // Small delay to ensure layout is calculated
                setTimeout(() => {
                    // Initialize horizontal loop
                    loop = horizontalLoop(slides, {
                        paused: true,
                        draggable: true,
                        center: false,
                        onChange: (element: HTMLElement, index: number) => {
                            // Update active class
                            slides.forEach((s) => s.classList.remove('active'));
                            if (element) {
                                element.classList.add('active');
                            }
                            setCurrentIndex(index);
                        },
                    }, gsap, Draggable);

                    // Navigation buttons - scoped to this component
                    const nextButton = sliderRef.current!.querySelector('[data-slider-button="next"]');
                    const prevButton = sliderRef.current!.querySelector('[data-slider-button="prev"]');

                    const handleNext = () => {
                        loop?.next({ ease: 'power3', duration: 0.725 });
                    };
                    const handlePrev = () => {
                        loop?.previous({ ease: 'power3', duration: 0.725 });
                    };

                    nextButton?.addEventListener('click', handleNext);
                    prevButton?.addEventListener('click', handlePrev);

                    // Click to slide
                    const clickHandlers: Array<() => void> = [];
                    slides.forEach((slide, i) => {
                        const handleClick = () => {
                            if (slide.classList.contains('active')) return;
                            loop?.toIndex(i, { ease: 'power3', duration: 0.725 });
                        };
                        slide.addEventListener('click', handleClick);
                        clickHandlers.push(() => slide.removeEventListener('click', handleClick));
                    });

                    // Set initial active state
                    if (slides[0]) {
                        slides[0].classList.add('active');
                    }

                    cleanup = () => {
                        nextButton?.removeEventListener('click', handleNext);
                        prevButton?.removeEventListener('click', handlePrev);
                        clickHandlers.forEach((cleanupFn) => cleanupFn());
                        if (loop?.draggable) {
                            loop.draggable.kill();
                        }
                        if (loop?.cleanup) {
                            loop.cleanup();
                        }
                    };
                }, 50);
            });
        }).catch((error) => {
            console.error('Failed to load Draggable/InertiaPlugin:', error);
        });
        }, 100);

        return () => {
            clearTimeout(initTimer);
            cleanup?.();
        };
    }, [isLoading, gsapModules, images.length]);

    function horizontalLoop(items: HTMLElement[], config: any, gsap: any, Draggable: any) {
        let timeline: any;
        let cleanupResize: (() => void) | undefined;
        items = gsap.utils.toArray(items);
        config = config || {};

        const ctx = gsap.context(() => {
            let onChange = config.onChange,
                lastIndex = 0,
                tl = gsap.timeline({
                    repeat: config.repeat,
                    onUpdate:
                        onChange &&
                        function () {
                            let i = tl.closestIndex();
                            if (lastIndex !== i) {
                                lastIndex = i;
                                onChange(items[i], i);
                            }
                        },
                    paused: config.paused,
                    defaults: { ease: 'none' },
                    onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
                }),
                length = items.length,
                startX = items[0].offsetLeft,
                times: number[] = [],
                widths: number[] = [],
                spaceBefore: number[] = [],
                xPercents: number[] = [],
                curIndex = 0,
                indexIsDirty = false,
                center = config.center,
                pixelsPerSecond = (config.speed || 1) * 100,
                snap =
                    config.snap === false
                        ? (v: number) => v
                        : gsap.utils.snap(config.snap || 1),
                timeOffset = 0,
                container =
                    center === true
                        ? items[0].parentNode
                        : gsap.utils.toArray(center)[0] || items[0].parentNode,
                totalWidth: number,
                getTotalWidth = () =>
                    items[length - 1].offsetLeft +
                    (xPercents[length - 1] / 100) * widths[length - 1] -
                    startX +
                    spaceBefore[0] +
                    items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], 'scaleX') +
                    (parseFloat(config.paddingRight) || 0),
                populateWidths = () => {
                    let b1 = container.getBoundingClientRect(),
                        b2: DOMRect;
                    items.forEach((el, i) => {
                        widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px') as string);
                        xPercents[i] = snap(
                            (parseFloat(gsap.getProperty(el, 'x', 'px') as string) / widths[i]) *
                                100 +
                                (gsap.getProperty(el, 'xPercent') as number)
                        );
                        b2 = el.getBoundingClientRect();
                        spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
                        b1 = b2;
                    });
                    gsap.set(items, {
                        xPercent: (i: number) => xPercents[i],
                    });
                    totalWidth = getTotalWidth();
                },
                timeWrap: (t: number) => number,
                populateOffsets = () => {
                    timeOffset = center ? (tl.duration() * (container.offsetWidth / 2)) / totalWidth : 0;
                    center &&
                        times.forEach((t, i) => {
                            times[i] = timeWrap(
                                (tl.labels['label' + i] as number) +
                                    (tl.duration() * widths[i]) / 2 / totalWidth -
                                    timeOffset
                            );
                        });
                },
                getClosest = (values: number[], value: number, wrap: number) => {
                    let i = values.length,
                        closest = 1e10,
                        index = 0,
                        d: number;
                    while (i--) {
                        d = Math.abs(values[i] - value);
                        if (d > wrap / 2) {
                            d = wrap - d;
                        }
                        if (d < closest) {
                            closest = d;
                            index = i;
                        }
                    }
                    return index;
                },
                populateTimeline = () => {
                    let i: number,
                        item: HTMLElement,
                        curX: number,
                        distanceToStart: number,
                        distanceToLoop: number;
                    tl.clear();
                    for (i = 0; i < length; i++) {
                        item = items[i];
                        curX = (xPercents[i] / 100) * widths[i];
                        distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
                        distanceToLoop =
                            distanceToStart + widths[i] * (gsap.getProperty(item, 'scaleX') as number);
                        tl.to(
                            item,
                            {
                                xPercent: snap((curX - distanceToLoop) / widths[i] * 100),
                                duration: distanceToLoop / pixelsPerSecond,
                            },
                            0
                        )
                            .fromTo(
                                item,
                                {
                                    xPercent: snap(
                                        (curX - distanceToLoop + totalWidth) / widths[i] * 100
                                    ),
                                },
                                {
                                    xPercent: xPercents[i],
                                    duration:
                                        (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
                                    immediateRender: false,
                                },
                                distanceToLoop / pixelsPerSecond
                            )
                            .add('label' + i, distanceToStart / pixelsPerSecond);
                        times[i] = distanceToStart / pixelsPerSecond;
                    }
                    timeWrap = gsap.utils.wrap(0, tl.duration());
                },
                refresh = (deep: boolean) => {
                    let progress = tl.progress();
                    tl.progress(0, true);
                    populateWidths();
                    deep && populateTimeline();
                    populateOffsets();
                    deep && tl.draggable ? tl.time(times[curIndex], true) : tl.progress(progress, true);
                },
                onResize = () => refresh(true),
                proxy: HTMLDivElement;

            gsap.set(items, { x: 0 });
            populateWidths();
            populateTimeline();
            populateOffsets();
            window.addEventListener('resize', onResize);
            cleanupResize = () => window.removeEventListener('resize', onResize);

            function toIndex(index: number, vars: any) {
                Math.abs(index - curIndex) > length / 2 &&
                    (index += index > curIndex ? -length : length);
                let newIndex = gsap.utils.wrap(0, length, index),
                    time = times[newIndex];
                if (time > tl.time() !== index > curIndex && index !== curIndex) {
                    time += tl.duration() * (index > curIndex ? 1 : -1);
                }
                if (time < 0 || time > tl.duration()) {
                    vars.modifiers = { time: timeWrap };
                }
                curIndex = newIndex;
                vars.overwrite = true;
                gsap.killTweensOf(proxy);
                return vars.duration === 0 ? tl.time(timeWrap(time)) : tl.tweenTo(time, vars);
            }

            tl.toIndex = (index: number, vars: any) => toIndex(index, vars);
            tl.closestIndex = (setCurrent?: boolean) => {
                let index = getClosest(times, tl.time(), tl.duration());
                if (setCurrent) {
                    curIndex = index;
                    indexIsDirty = false;
                }
                return index;
            };
            tl.current = () => (indexIsDirty ? tl.closestIndex(true) : curIndex);
            tl.next = (vars: any) => toIndex(tl.current() + 1, vars);
            tl.previous = (vars: any) => toIndex(tl.current() - 1, vars);
            tl.times = times;
            tl.progress(1, true).progress(0, true);

            if (config.draggable && typeof Draggable !== 'undefined') {
                proxy = document.createElement('div');
                let wrap = gsap.utils.wrap(0, 1),
                    ratio: number,
                    startProgress: number,
                    draggable: any,
                    dragSnap: any,
                    lastSnap: number,
                    initChangeX: number,
                    wasPlaying: boolean,
                    align = () => tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio)),
                    syncIndex = () => tl.closestIndex(true);

                draggable = Draggable.create(proxy, {
                    trigger: items[0].parentNode as HTMLElement,
                    type: 'x',
                    onPressInit() {
                        let x = this.x;
                        gsap.killTweensOf(tl);
                        wasPlaying = !tl.paused();
                        tl.pause();
                        startProgress = tl.progress();
                        refresh(false);
                        ratio = 1 / totalWidth;
                        initChangeX = startProgress / -ratio - x;
                        gsap.set(proxy, { x: startProgress / -ratio });
                    },
                    onDrag: align,
                    onThrowUpdate: align,
                    overshootTolerance: 0,
                    inertia: true,
                    snap(value: number) {
                        if (Math.abs(startProgress / -ratio - this.x) < 10) {
                            return lastSnap + initChangeX;
                        }
                        let time = -(value * ratio) * tl.duration(),
                            wrappedTime = timeWrap(time),
                            snapTime = times[getClosest(times, wrappedTime, tl.duration())],
                            dif = snapTime - wrappedTime;
                        Math.abs(dif) > tl.duration() / 2 &&
                            (dif += dif < 0 ? tl.duration() : -tl.duration());
                        lastSnap = (time + dif) / tl.duration() / -ratio;
                        return lastSnap;
                    },
                    onRelease() {
                        syncIndex();
                        draggable.isThrowing && (indexIsDirty = true);
                    },
                    onThrowComplete: () => {
                        syncIndex();
                        wasPlaying && tl.play();
                    },
                })[0];
                tl.draggable = draggable;
            }

            tl.closestIndex(true);
            lastIndex = curIndex;
            onChange && onChange(items[curIndex], curIndex);
            timeline = tl;
        }, listRef.current);

        // Store cleanup function on timeline
        if (timeline) {
            (timeline as any).cleanup = () => {
                ctx.revert();
                cleanupResize?.();
            };
        }

        return timeline;
    }

    const totalSlides = images.length;

    return (
        <div className="highlights-carousel__section" ref={sliderRef}>
            <div className="highlights-carousel__overlay">
                <div className="highlights-carousel__overlay-inner">
                    <div className="highlights-carousel__overlay-count">
                        <div className="highlights-carousel__count-col">
                            <h2
                                data-slide-count="step"
                                className="highlights-carousel__count-heading"
                            >
                                {String(currentIndex + 1).padStart(2, '0')}
                            </h2>
                        </div>
                        <div className="highlights-carousel__count-divider"></div>
                        <div className="highlights-carousel__count-col">
                            <h2
                                data-slide-count="total"
                                className="highlights-carousel__count-heading"
                            >
                                {String(totalSlides).padStart(2, '0')}
                            </h2>
                        </div>
                    </div>
                    <div className="highlights-carousel__overlay-nav">
                        <button
                            type="button"
                            aria-label="previous slide"
                            data-slider-button="prev"
                            className="highlights-carousel__btn"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="100%"
                                viewBox="0 0 17 12"
                                fill="none"
                                className="highlights-carousel__btn-arrow"
                                aria-hidden="true"
                            >
                                <path
                                    d="M6.28871 12L7.53907 10.9111L3.48697 6.77778H16.5V5.22222H3.48697L7.53907 1.08889L6.28871 0L0.5 6L6.28871 12Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>
                        <button
                            type="button"
                            aria-label="next slide"
                            data-slider-button="next"
                            className="highlights-carousel__btn"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="100%"
                                viewBox="0 0 17 12"
                                fill="none"
                                className="highlights-carousel__btn-arrow next"
                                aria-hidden="true"
                            >
                                <path
                                    d="M6.28871 12L7.53907 10.9111L3.48697 6.77778H16.5V5.22222H3.48697L7.53907 1.08889L6.28871 0L0.5 6L6.28871 12Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div className="highlights-carousel__main">
                <div className="highlights-carousel__wrap">
                    <div data-slider="list" className="highlights-carousel__list" ref={listRef}>
                        {images.map((image, index) => (
                            <div
                                key={index}
                                data-slider="slide"
                                className={`highlights-carousel__slide ${index === 0 ? 'active' : ''}`}
                            >
                                <div className="highlights-carousel__slide-inner">
                                    <Image
                                        src={image.src}
                                        alt={image.alt}
                                        width={1200}
                                        height={800}
                                        className="highlights-carousel__img"
                                        priority={index === 0}
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
