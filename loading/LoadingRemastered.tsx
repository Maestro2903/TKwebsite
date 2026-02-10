"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export default function LoadingRemastered({ onFinished }: { onFinished?: () => void }) {
    return (
        <HybridXLoader onComplete={onFinished} />
    );
}

function HybridXLoader({ onComplete }: { onComplete?: () => void }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [stage, setStage] = useState<
        | "logo"
        | "logo-hold"
        | "flip"
        | "hold"
        | "shrink-out"
        | "descend"
    >("logo");

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);

        const logoHoldTimer = setTimeout(() => setStage("logo-hold"), 2500);
        const flipTimer = setTimeout(() => setStage("flip"), 3000);
        const holdTimer = setTimeout(() => setStage("hold"), 4000);
        const shrinkTimer = setTimeout(() => {
            setStage("shrink-out");
            // Direct finish after shrink starts
            setTimeout(() => {
                setIsLoading(false);
                setTimeout(() => {
                    if (onComplete) onComplete();
                }, 800);
            }, 500);
        }, 5000);

        return () => {
            window.removeEventListener("resize", checkMobile);
            clearTimeout(logoHoldTimer);
            clearTimeout(flipTimer);
            clearTimeout(holdTimer);
            clearTimeout(shrinkTimer);
        };
    }, [onComplete]);

    const logoVariant: Variants = {
        logo: {
            scale: isMobile ? 0.7 : 1,
            opacity: 1,
            rotateY: 0,
            filter: "brightness(1)",
            transition: { duration: 0 }
        },
        "logo-hold": {
            scale: isMobile ? 0.7 : 1,
            rotateY: 0,
            opacity: 1,
            filter: "brightness(1)",
            transition: { duration: 0.5 }
        },
        flip: {
            rotateY: 90,
            scale: isMobile ? 0.8 : 1.1,
            opacity: 0,
            filter: "brightness(2)",
            transition: { duration: 0.5, ease: "easeIn" }
        }
    };

    const tkxVariant: Variants = {
        initial: {
            rotateY: -90,
            scale: isMobile ? 0.8 : 1.1,
            opacity: 0,
            filter: "brightness(2)"
        },
        flip: {
            rotateY: 0,
            scale: isMobile ? 0.7 : 1,
            opacity: 1,
            filter: "brightness(1)",
            transition: { duration: 0.5, ease: "easeOut", delay: 0.5 }
        },
        hold: {
            rotateY: 0,
            scale: isMobile ? 0.7 : 1,
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            filter: "brightness(1)",
            transition: { duration: 0.5 }
        },
        "shrink-out": {
            rotateY: 0,
            scale: isMobile ? 0.5 : 0.8,
            clipPath: "inset(50% 0% 50% 0%)",
            opacity: 0,
            transition: {
                duration: 1,
                ease: "easeInOut"
            }
        },
        descend: {
            opacity: 0,
            transition: { duration: 0.5 }
        }
    };

    const boxContainerVariant: Variants = {
        hidden: {
            opacity: 0,
            scale: isMobile ? 0.6 : 0.8,
            transition: { duration: 0.2 }
        },
        visible: {
            opacity: 1,
            scale: isMobile ? 1 : 1.3,
            transition: {
                opacity: { duration: 1.5, ease: "easeInOut" },
                scale: { duration: 1.5, ease: "easeInOut" }
            }
        },
        "descend": {
            opacity: 1,
            scale: isMobile ? 1 : 1.3,
            y: ["0vh", "29.7vh"], // Precise alignment with Hero button center
            transition: {
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                y: { duration: 3.0, ease: [0.22, 1, 0.36, 1] } // Quintic ease-out for smoother landing
            }
        }
    };

    const centerShapeVariant: Variants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { delay: 2.0, duration: 0.5, ease: "easeOut" }
        }
    };

    const showLogo = stage === "logo" || stage === "logo-hold" || stage === "flip";
    const showTkx = stage === "flip" || stage === "hold" || stage === "shrink-out";
    const showBox = stage === "shrink-out";

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        key="loader-inner"
                        className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"
                    >
                        {/* BACKGROUND LAYER - Fades out */}
                        <motion.div
                            className="absolute inset-0 bg-neutral-900 pointer-events-none"
                            animate={{ opacity: stage === "descend" ? 0 : 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            exit={{ opacity: 0 }}
                        />

                        {/* PARTICLES - Fade out */}
                        <motion.div
                            className="absolute inset-0 pointer-events-none overflow-hidden"
                            animate={{ opacity: (stage === "descend") ? 0 : 1 }}
                            transition={{ duration: 0.5 }}
                            exit={{ opacity: 0 }}
                        >
                            {[...Array(isMobile ? 15 : 35)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute rounded-full"
                                    style={{
                                        width: Math.random() * (isMobile ? 2 : 3) + 1 + "px",
                                        height: Math.random() * (isMobile ? 2 : 3) + 1 + "px",
                                        background: i % 3 === 0 ? "#8B6914" : i % 3 === 1 ? "#6B4F0A" : "#4a3000",
                                        left: Math.random() * 100 + "%",
                                        top: Math.random() * 100 + "%",
                                        opacity: 0.5,
                                    }}
                                    animate={{ y: [0, -120], x: Math.sin(i) * 30, opacity: [0, 0.5, 0] }}
                                    transition={{ duration: 6 + Math.random() * 5, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 3 }}
                                />
                            ))}
                        </motion.div>

                        <div className="relative w-[200px] md:w-[300px] h-[200px] md:h-[300px] flex items-center justify-center" style={{ perspective: "1000px" }}>
                            {/* LOGO */}
                            <AnimatePresence mode="popLayout">
                                {showLogo && (
                                    <motion.div
                                        key="logo-container"
                                        variants={logoVariant}
                                        initial="logo"
                                        animate={stage}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        className="absolute z-20"
                                    >
                                        <img src="/tk-logo-animated.svg" className="w-24 md:w-36 h-24 md:h-36" alt="Logo" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* TKX */}
                            <AnimatePresence mode="popLayout">
                                {showTkx && (
                                    <motion.div
                                        key="tkx-container"
                                        variants={tkxVariant}
                                        initial="initial"
                                        animate={stage}
                                        exit={{ opacity: 0 }}
                                        className="absolute z-10"
                                    >
                                        <img src="/test-x.svg" className="w-[100px] md:w-[140px]" alt="TKX" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* THE PERSISTENT BOX */}
                            <motion.div
                                key="box-container"
                                variants={boxContainerVariant}
                                initial="hidden"
                                animate={stage}
                                className="absolute z-50 flex items-center justify-center pointer-events-none"
                                style={{ width: isMobile ? "100px" : "140px", height: isMobile ? "100px" : "140px" }}
                            >
                                <svg width="100%" height="100%" viewBox="0 0 200 200">
                                    <defs>
                                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#785A14" />
                                            <stop offset="50%" stopColor="#F5D76E" />
                                            <stop offset="100%" stopColor="#B98C23" />
                                        </linearGradient>
                                        <filter id="shadow">
                                            <feGaussianBlur stdDeviation="0.5" />
                                        </filter>
                                    </defs>
                                    <path d="M 75 100 L 95 80 L 115 100 L 95 120 Z" fill="url(#goldGradient)" filter="url(#shadow)" />
                                    <motion.path
                                        d="M 79 100 L 95 84 L 111 100 L 110 101 L 95 86 L 80 101 L 79 100 Z"
                                        fill="black"
                                        variants={centerShapeVariant}
                                        initial="hidden"
                                        animate={showBox ? "visible" : "hidden"}
                                    />
                                </svg>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
