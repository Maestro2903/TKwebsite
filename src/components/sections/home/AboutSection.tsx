"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@/hooks/useGSAP";

import { Y2K_IMAGES } from "@/data/y2k-images";
import ParallaxFloatingImages from "@/components/ui/parallax-floating-images";
import { Tooltip } from "@/components/ui/tooltip-card";

// Exact HTML structure from original Zeit Media website for About Section with GSAP animations
export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const parallaxBgRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [gsapModules, isLoading] = useGSAP();

  // Use CDN URLs for images since local versions may not be available
  const parallaxImageSrc = "/assets/images/parallax.webp";

  useEffect(() => {
    if (isLoading || !gsapModules) return;
    const { gsap, ScrollTrigger } = gsapModules;
    const ctx = gsap.context(() => {
      // Heading animation
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 80%",
              end: "top 50%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      // Parallax background image
      if (parallaxBgRef.current) {
        gsap.fromTo(
          parallaxBgRef.current.querySelector(".parallax-img"),
          { y: "10%" },
          {
            y: "-40%",
            ease: "none",
            scrollTrigger: {
              trigger: parallaxBgRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 2,
            },
          },
        );
      }

      // Animate all stats cards together
      if (card1Ref.current && card2Ref.current && card3Ref.current) {
        const cards = [card1Ref.current, card2Ref.current, card3Ref.current];

        gsap.fromTo(
          cards,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            stagger: 0,
            scrollTrigger: {
              trigger: card1Ref.current.parentElement?.parentElement,
              start: "top 75%",
              end: "top 50%",
              scrub: 1,
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isLoading, gsapModules]);

  return (
    <div
      ref={sectionRef}
      className="u-section u-zindex-3"
      style={{ position: "relative" }}
    >
      <ParallaxFloatingImages images={Y2K_IMAGES} className="z-0" />
      <div
        data-wf--spacer--section-space="large"
        className="u-section-spacer w-variant-8cc18b30-4618-8767-0111-f6abfe45aaa3 u-ignore-trim"
      />

      <div className="u-container u-grid-custom relative z-10">
        <div className="about_heading u-column-8">
          <h2
            ref={headingRef}
            data-heading="heading-animation"
            className="home_about_heading"
          >
            TAKSHASHILA
          </h2>
          <div
            data-wf--typography-paragraph--font-style="inherit"
            className="c-paragraph w-richtext u-rich-text u-max-width-60ch u-opacity-80 u-margin-bottom-7"
          >
            <p>
              <Tooltip content="The flagship techno-cultural fest of Chennai Institute of Technology — Tamil Nadu’s most awaited cultural celebration.">
                <span className="cursor-pointer font-semibold text-[#06B6D4] transition-colors hover:text-[#22D3EE]">
                  Takshashila
                </span>
              </Tooltip>{" "}
              is back to set the stage alive. It’s where creativity, innovation,
              and passion collide — giving students the freedom to express,
              experiment, and excel.
            </p>
            <p>
              This year’s theme,{" "}
              <Tooltip content="A celebration of bold energy, fearless expression, and the ever-evolving culture of today’s generation.">
                <span className="cursor-pointer font-semibold text-[#06B6D4] transition-colors hover:text-[#22D3EE]">
                  GenZ Vibes
                </span>
              </Tooltip>
              , brings{" "}
              <Tooltip content="From trend-driven performances and culture-forward showcases to cutting-edge technical challenges and innovation-led events.">
                <span className="cursor-pointer font-semibold text-[#06B6D4] transition-colors hover:text-[#22D3EE]">
                  50+ events
                </span>
              </Tooltip>{" "}
              spanning workshops, competitions, and{" "}
              <Tooltip content="Technical presentations and hands-on sessions led by industry experts across AI, robotics, design, and more.">
                <span className="cursor-pointer font-semibold text-[#06B6D4] transition-colors hover:text-[#22D3EE]">
                  expert-led sessions
                </span>
              </Tooltip>
              . Ideas move fast, creativity runs loud, and{" "}
              <Tooltip content="15,000+ students and attendees from across India, with a total prize pool of ₹20 Lakhs+.">
                <span className="cursor-pointer font-semibold text-[#06B6D4] transition-colors hover:text-[#22D3EE]">
                  Gen Z takes center stage
                </span>
              </Tooltip>
              .
            </p>
          </div>
          <div className="btn-group">
            <a href="/events" className="btn-bubble-arrow w-inline-block">
              <div className="btn-bubble-arrow__arrow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="100%"
                  className="btn-bubble-arrow__arrow-svg"
                >
                  <polyline
                    points="18 8 18 18 8 18"
                    fill="none"
                    stroke="currentColor"
                    strokeMiterlimit={10}
                    strokeWidth={1.5}
                  />
                  <line
                    x1="18"
                    y1="18"
                    x2="5"
                    y2="5"
                    fill="none"
                    stroke="currentColor"
                    strokeMiterlimit={10}
                    strokeWidth={1.5}
                  />
                </svg>
              </div>
              <div className="btn-bubble-arrow__content">
                <span className="btn-bubble-arrow__content-text">
                  Learn More
                </span>
              </div>
              <div className="btn-bubble-arrow__arrow is--duplicate">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="100%"
                  className="btn-bubble-arrow__arrow-svg"
                >
                  <polyline
                    points="18 8 18 18 8 18"
                    fill="none"
                    stroke="currentColor"
                    strokeMiterlimit={10}
                    strokeWidth={1.5}
                  />
                  <line
                    x1="18"
                    y1="18"
                    x2="5"
                    y2="5"
                    fill="none"
                    stroke="currentColor"
                    strokeMiterlimit={10}
                    strokeWidth={1.5}
                  />
                </svg>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div
        data-wf--spacer--section-space="large"
        className="u-section-spacer w-variant-8cc18b30-4618-8767-0111-f6abfe45aaa3 u-ignore-trim"
      />

      {/* Parallax Stats Section */}
      <div className="parallax-demo-row__half">
        <div
          ref={parallaxBgRef}
          data-parallax-scrub="2"
          data-parallax="trigger"
          data-parallax-start="-30"
          data-parallax-end="-10"
          className="parallax-bg"
        >
          <img
            src={parallaxImageSrc}
            loading="lazy"
            width={2752}
            height={1536}
            alt=""
            sizes="100vw"
            className="parallax-img"
            style={{ objectPosition: "center" }}
          />
        </div>

        {/* Dark blur overlay for readability */}
        <div
          className="absolute z-[1] backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.01)",
            inset: "-25% 0 0 0",
            height: "150%",
          }}
        />

        <div className="parallax-demo-row u-container relative z-[2] pb-16 pt-16 md:pb-24 md:pt-24 lg:pb-32 lg:pt-32">
          {/* Card 1: 50+ */}
          <div className="parallax-demo-row__third">
            <div
              ref={card1Ref}
              data-parallax-end="0"
              data-parallax="trigger"
              data-parallax-disable="mobileLandscape"
              data-parallax-start="0"
              className="parallax-demo-card"
            >
              <div className="flex h-full flex-col items-center justify-center text-center px-4">
                <div className="mb-3 text-4xl font-black leading-none sm:text-5xl md:text-6xl lg:text-7xl">
                  50+
                </div>
                <div className="text-sm font-semibold text-neutral-700 sm:text-base md:text-lg lg:text-xl dark:text-neutral-300 max-w-32 sm:max-w-40 md:max-w-48 leading-tight">
                  <div>Technical &amp;</div>
                  <div>Non-Technical Events</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: 15,000+ */}
          <div className="parallax-demo-row__third">
            <div
              ref={card2Ref}
              data-parallax-disable="mobileLandscape"
              data-parallax="trigger"
              data-parallax-start="0"
              data-parallax-end="0"
              className="parallax-demo-card"
            >
              <div className="flex h-full flex-col items-center justify-center text-center px-4">
                <div className="mb-3 text-4xl font-black leading-none sm:text-5xl md:text-6xl lg:text-7xl">
                  15K+
                </div>
                <div className="text-sm font-semibold text-neutral-700 sm:text-base md:text-lg lg:text-xl dark:text-neutral-300 max-w-32 sm:max-w-40 md:max-w-48 leading-tight">
                  <div>Students &amp; Attendees</div>
                  <div>from across India</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: ₹20 Lakhs+ */}
          <div className="parallax-demo-row__third">
            <div
              ref={card3Ref}
              data-parallax-disable="mobileLandscape"
              data-parallax="trigger"
              data-parallax-start="0"
              data-parallax-end="0"
              className="parallax-demo-card"
            >
              <div className="flex h-full flex-col items-center justify-center text-center px-4">
                <div className="mb-3 text-4xl font-black leading-none sm:text-5xl md:text-6xl lg:text-7xl">
                  ₹20L+
                </div>
                <div className="text-sm font-semibold text-neutral-700 sm:text-base md:text-lg lg:text-xl dark:text-neutral-300 max-w-32 sm:max-w-40 md:max-w-48 leading-tight">
                  <div>Total Prize Pool</div>
                  <div>&amp; Awards</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
