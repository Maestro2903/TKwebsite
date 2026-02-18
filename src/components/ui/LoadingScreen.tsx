"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Flame logo SVG path from the original Takshashila website
const FLAME_PATH =
  "m413.288 213.138 3.801 7.084 52.496 97.577c7.58 12.701 10.576 22.199 16.631 42.061l-8.305 17.978-15.681 34.092c-6.542 11.236-11.031 16.933-19.957 26.564-12.355 14.611-22.325 33.36-21.858 34.534 5.217 13.089 4.793 20.059 0 32.051-40.644-31.623-19.73-81.195-7.603-114.401.199-13.367-4.143-25.815-19.006-51.358-10.382 1.017-15.474-1.769-19.482-15.496-17.899-5.826-28.494-6.192-47.517-6.199 2.05.318 1.87-.228 21.382 9.741 12.758 5.696 28.326 23.002 26.135 50.03-2.605 17.024-23.9 38.506-52.744 52.686 3.711.519 9.978-.443 9.503 1.328-18.177 12.24-30.277 18.077-51.318 28.779-41.34 29.663-50.694 54.161-47.042 98.731 2.56 18.827 7.109 32.657 13.78 45.16 5.702 11.322 14.883 21.853 18.532 36.305.593-12.245 1.375-15.295 3.326-15.939 5.756 22.082 17.897 31.488 47.517 45.603 32.099 16.819 46.66 26.129 66.999 47.373-1.771-10.826-3.194-16.449-7.128-27.45 54.169 69.953 59.871 139.021 7.603 224.028 65.446-52.89 102.711-78.535 162.508-110.686 5.012-5.887 5.033-9.068 1.9-14.61-39.878-29.573-55.61-44.607-77.927-71.725-19.508-29.166-30.618-46.327-48.943-69.953 29.585 8.645 44.796 23.476 70.325 61.541l14.73-9.74c-7.496-14.24-10.855-21.082-14.73-30.376l39.666-9.297c7.814 15.608 11.491 26.245 17.582 46.488 17.058-1.696 24.539-.719 37.063 1.771l-6.88-28.509h16.631c19.255 16.798 31 24.691 53.219 36.747 11.092-25.762 32.787-42.06 64.623-54.014l8.791-5.756c-4.358-1.644-38.152-23.401 8.79-5.756l17.582-18.152c-43.716-30.549-14.255-56.229 11.404-20.366 7.902-18.047 8.701-30.999 5.702-57.557l-3.802-9.74-15.205-42.946-18.056-3.985-8.078-29.221c7.366.097 12.079 3.236 20.907 11.069-18.399-66.855-49.715-79.033-104.062-69.954.272 2.648 1.748 4.208 6.177 7.084 7.444.443 23.854 4.25 29.936 15.939 3.643 6.346 10.359 22.403 8.078 35.862-.95 3.838-3.897 12.308-8.078 15.496-.937-1.932-1.623 20.555-34.212 17.71-32.589-2.845-50.97-52.585-17.581-77.48l4.276-14.611c-1.673-8.681-14.503-50.299-21.858-55.785-2.029-4.568-4.29-7.27 1.178-10.895 6.281 0-54.314-72.193-85.758-107.318-25.849-32.586-17.74-65.821-10.453-78.365 17.866-43.212 55.911-54.31 72.7-54.458-14.065-10.271-34.687-11.068-43.24-10.183-33.072 2.48-59.08 18.153-67.949 25.679-31.551 19.835-51.16 71.725-57.02 95.19Z";

// CSS keyframes for the SVG flame draw animation (from original Takshashila HTML)
const ANIMATION_CSS = `
  .main_logo_1 {
    z-index: 1000;
    animation: svg_design 4s infinite;
  }

  @keyframes svg_design {
    0% {
      display: block;
      stroke-dasharray: 580;
      opacity: 0;
      transform: scale(1);
    }
    20% {
      opacity: 1;
      fill: transparent;
    }
    50% {
      fill: transparent;
      stroke-dasharray: 100;
      transform: scale(1.1);
    }
    85% {
      stroke-opacity: 0;
    }
    94% {
      display: block;
      fill: transparent;
      opacity: 1;
      transform: scale(1);
    }
    100% {
      display: block;
      stroke-dasharray: 580;
      opacity: 0;
      transform: scale(1);
    }
  }

  .flame-logo-image {
    opacity: 0;
    animation: flameFillFade 4s infinite;
  }

  @keyframes flameFillFade {
    0%, 20% { opacity: 0; }
    40% { opacity: 1; }
    50% { opacity: 1; }
    94% { opacity: 1; }
    100% { opacity: 0; }
  }
`;

// Deterministic particle data so server and client render the same (avoids hydration mismatch)
const PARTICLE_COUNT = 35;
const GOLD_COLORS = ["#00e5ff", "#29b6f6", "#0d47a1"] as const;

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  width: 1 + (i % 5) * 0.4,
  height: 1 + (i % 7) * 0.35,
  left: (i * 13) % 100,
  top: (i * 17) % 100,
  color: GOLD_COLORS[i % 3],
  duration: 6 + (i % 5),
  delay: (i % 3) * 0.8,
  x: Math.sin(i) * 30,
}));

export default function LoadingRemastered({ onFinished }: { onFinished?: () => void }) {
  return <HybridXLoader onComplete={onFinished} />;
}

function HybridXLoader({ onComplete }: { onComplete?: () => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [stage, setStage] = useState<"logo" | "logo-hold" | "fade-out">("logo");

  useEffect(() => {
    const logoHoldTimer = setTimeout(() => setStage("logo-hold"), 2500);
    const fadeOutTimer = setTimeout(() => setStage("fade-out"), 4000);
    const endTimer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => onComplete?.(), 600);
    }, 5200);

    return () => {
      clearTimeout(logoHoldTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(endTimer);
    };
  }, [onComplete]);

  const logoVariant: Variants = {
    logo: {
      scale: 1,
      opacity: 1,
      filter: "brightness(1)",
      transition: { duration: 0 },
    },
    "logo-hold": {
      scale: 1,
      opacity: 1,
      filter: "brightness(1)",
      transition: { duration: 0.5 },
    },
    "fade-out": {
      scale: 0.9,
      opacity: 0,
      filter: "brightness(1.2)",
      transition: { duration: 0.8, ease: "easeInOut" },
    },
  };

  const showLogo = stage === "logo" || stage === "logo-hold" || stage === "fade-out";

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Inject CSS keyframes for SVG flame animation */}
      <style dangerouslySetInnerHTML={{ __html: ANIMATION_CSS }} />

      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader-inner"
            className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"
          >
            {/* BACKGROUND */}
            <motion.div
              className="absolute inset-0 bg-neutral-900 pointer-events-none"
              animate={{ opacity: stage === "fade-out" ? 0 : 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              exit={{ opacity: 0 }}
            />

            {/* PARTICLES - deterministic positions to avoid hydration mismatch */}
            <motion.div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              animate={{ opacity: stage === "fade-out" ? 0 : 1 }}
              transition={{ duration: 0.4 }}
              exit={{ opacity: 0 }}
            >
              {PARTICLES.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${p.width}px`,
                    height: `${p.height}px`,
                    background: p.color,
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                    opacity: 0.5,
                  }}
                  animate={{
                    y: [0, -120],
                    x: p.x,
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: p.delay,
                  }}
                />
              ))}
            </motion.div>

            {/* LOGO — SVG flame animation replaces the old <img> */}
            <div
              className="relative w-[200px] md:w-[300px] h-[200px] md:h-[300px] flex items-center justify-center"
              style={{ perspective: "1000px" }}
            >
              <AnimatePresence mode="popLayout">
                {showLogo && (
                  <motion.div
                    key="logo-container"
                    variants={logoVariant}
                    initial="logo"
                    animate={stage}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute z-20"
                  >
                    <svg
                      width="1000"
                      height="1000"
                      viewBox="0 0 1000 1000"
                      fill="none"
                      className="main_logo_1 w-48 md:w-52 h-48 md:h-52"
                      style={{
                        fill: "transparent",
                        opacity: 0,
                      }}
                    >
                      <defs>
                        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#00e5ff" />
                          <stop offset="40%" stopColor="#29b6f6" />
                          <stop offset="100%" stopColor="#0d47a1" />
                        </linearGradient>
                        <clipPath id="flameClip">
                          <path d={FLAME_PATH} />
                        </clipPath>
                      </defs>
                      {/* Flame stroke outline animation */}
                      <path
                        d={FLAME_PATH}
                        stroke="#29b6f6"
                        strokeLinejoin="round"
                        strokeWidth="4"
                      />
                      {/* TK logo image clipped to the flame shape, fades in */}
                      <image
                        href="/assets/images/tk-logo.webp"
                        x="-500"
                        y="-500"
                        width="2000"
                        height="2000"
                        clipPath="url(#flameClip)"
                        className="flame-logo-image"
                        preserveAspectRatio="xMidYMid slice"
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
