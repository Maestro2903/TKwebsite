"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Deterministic particle data so server and client render the same (avoids hydration mismatch)
const PARTICLE_COUNT = 35;
const GOLD_COLORS = ["#8B6914", "#6B4F0A", "#4a3000"] as const;

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

            {/* LOGO ONLY - no X / no box */}
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
                    <img
                      src="/tk-logo-animated.svg"
                      className="w-24 md:w-36 h-24 md:h-36"
                      alt="Takshashila Logo"
                    />
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
