// "use client";

// import { useEffect, useState } from "react";
// import { motion, AnimatePresence, Variants } from "framer-motion";

// export default function HybridXLoader() {
//     const [isLoading, setIsLoading] = useState(true);
//     const [stage, setStage] = useState<
//         | "logo"
//         | "logo-hold"
//         | "flip"
//         | "hold"
//         | "fade"
//     >("logo");

//     useEffect(() => {
//         // --- TIMELINE ---
//         // 0-3s:   Logo enters
//         // 3.0s:   Logo Hold
//         // 3.5s:   Flip Starts
//         // 6.0s:   Hold TKX
//         // 7.5s:   Fade out TKX (Starts here)
//         // 9.5s:   Unmount (Pushed back to allow 2s fade)

//         const logoHoldTimer = setTimeout(() => setStage("logo-hold"), 3000);
//         const flipTimer     = setTimeout(() => setStage("flip"), 3500);
//         const holdTimer     = setTimeout(() => setStage("hold"), 6000);
//         const fadeTimer     = setTimeout(() => setStage("fade"),6000);
        
//         // CHANGED: Increased from 8500 to 9500 to give the fade time to finish
//         const endTimer      = setTimeout(() => setIsLoading(false), 9500);

//         return () => {
//             clearTimeout(logoHoldTimer);
//             clearTimeout(flipTimer);
//             clearTimeout(holdTimer);
//             clearTimeout(fadeTimer);
//             clearTimeout(endTimer);
//         };
//     }, []);

//     if (!isLoading) return null;

//     // --- VARIANTS ---

//     const logoVariant: Variants = {
//         logo: {
//             scale: 1,
//             opacity: 1,
//             rotateY: 0,
//             filter: "brightness(1)",
//             transition: { duration: 0 }
//         },
//         "logo-hold": {
//             scale: 1,
//             rotateY: 0,
//             opacity: 1,
//             filter: "brightness(1)",
//             transition: { duration: 0.5 }
//         },
//         flip: {
//             rotateY: 90,
//             scale: 1.1,
//             opacity: 0,
//             filter: "brightness(2)",
//             transition: { duration: 0.5, ease: "easeIn" }
//         }
//     };

//     const tkxVariant: Variants = {
//         initial: {
//             rotateY: -90,
//             scale: 1.1,
//             opacity: 0,
//             filter: "brightness(2)"
//         },
//         flip: {
//             rotateY: 0,
//             scale: 1,
//             opacity: 1,
//             filter: "brightness(1)",
//             transition: { duration: 0.5, ease: "easeOut", delay: 0.5 }
//         },
//         hold: {
//             rotateY: 0,
//             scale: 1,
//             opacity: 1,
//             filter: "brightness(1)",
//             transition: { duration: 0.5 }
//         },
//         // CHANGED: "Dissolve" Effect
//         fade: {
//             rotateY: 0,
//             scale: 1.5,             // Expands outwards
//             opacity: 0,             // Fades to invisible
//             filter: "blur(20px)",   // Heavy blur for "smoke/mist" effect
//             transition: { 
//                 duration: 1.8,      // Slower, smoother duration
//                 ease: "easeInOut" 
//             }
//         }
//     };

//     const showLogo = stage === "logo" || stage === "logo-hold" || stage === "flip";
//     const showTkx = stage === "flip" || stage === "hold" || stage === "fade";

//     return (
//         <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] overflow-hidden">
//             <div className="absolute inset-0 bg-black" />
//             <div
//                 className="absolute inset-0"
//                 style={{
//                     background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%)"
//                 }}
//             />

//             {/* PARTICLES */}
//             <div className="absolute inset-0 pointer-events-none overflow-hidden">
//                 {[...Array(35)].map((_, i) => (
//                     <motion.div
//                         key={i}
//                         className="absolute rounded-full"
//                         style={{
//                             width: Math.random() * 3 + 1 + "px",
//                             height: Math.random() * 3 + 1 + "px",
//                             background: i % 3 === 0 ? "#8B6914" : i % 3 === 1 ? "#6B4F0A" : "#4a3000",
//                             left: Math.random() * 100 + "%",
//                             top: Math.random() * 100 + "%",
//                             opacity: 0.5,
//                         }}
//                         animate={{ y: [0, -120], x: Math.sin(i) * 30, opacity: [0, 0.5, 0] }}
//                         transition={{ duration: 6 + Math.random() * 5, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 3 }}
//                     />
//                 ))}
//             </div>

//             <div
//                 className="relative w-[600px] h-[600px] flex items-center justify-center"
//                 style={{ perspective: "1000px" }}
//             >
//                 {/* LOGO */}
//                 <AnimatePresence>
//                     {showLogo && (
//                         <motion.div
//                             key="logo-container"
//                             className="absolute flex items-center justify-center z-10"
//                             style={{
//                                 backfaceVisibility: "hidden",
//                                 WebkitBackfaceVisibility: "hidden"
//                             }}
//                             variants={logoVariant}
//                             initial="logo"
//                             animate={stage}
//                         >
//                             <motion.img
//                                 src="/tk-logo-animated.svg"
//                                 alt="Takshashila Logo"
//                                 className="w-72 h-72 object-contain relative z-20"
//                                 style={{
//                                     mixBlendMode: "screen",
//                                     filter: "contrast(1.3) brightness(0.9)",
//                                     outline: "1px solid transparent"
//                                 }}
//                             />
//                         </motion.div>
//                     )}
//                 </AnimatePresence>

//                 {/* TKX */}
//                 <AnimatePresence>
//                     {showTkx && (
//                         <motion.div
//                             key="tkx-container"
//                             className="absolute flex items-center justify-center z-10 pointer-events-none"
//                             style={{
//                                 backfaceVisibility: "hidden",
//                                 WebkitBackfaceVisibility: "hidden"
//                             }}
//                             variants={tkxVariant}
//                             initial="initial"
//                             animate={stage}
//                         >
//                             <img
//                                 /* Ensure this matches your actual SVG file name */
//                                 src="/tk-goldx-bgremoved.png" 
//                                 alt="TKX"
//                                 className="w-[400px] object-contain"
//                                 style={{
//                                     outline: "1px solid transparent",
//                                     WebkitBackfaceVisibility: "hidden",
//                                     backfaceVisibility: "hidden"
//                                 }}
//                             />
//                         </motion.div>
//                     )}
//                 </AnimatePresence>
//             </div>
//         </div>
//     );
// }
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export default function HybridXLoader() {
    const [isLoading, setIsLoading] = useState(true);
    // Updated stage type to include 'zoom-through'
    const [stage, setStage] = useState<
        | "logo"
        | "logo-hold"
        | "flip"
        | "hold"
        | "zoom-through"
    >("logo");

    useEffect(() => {
        // --- TIMELINE ---
        // 0-3s:   Logo enters
        // 3.0s:   Logo Hold
        // 3.5s:   Logo Flips Out / TKX Flips In
        // 6.0s:   Hold TKX
        // 7.5s:   ZOOM START (X flies into camera)
        // 8.8s:   Unmount (Shortened slightly to sync with the zoom impact)

        const logoHoldTimer = setTimeout(() => setStage("logo-hold"), 3000);
        const flipTimer     = setTimeout(() => setStage("flip"), 3500);
        const holdTimer     = setTimeout(() => setStage("hold"), 6000);
        const zoomTimer     = setTimeout(() => setStage("zoom-through"), 7500);
        
        // Cut the loader exactly when the zoom "hits" the screen
        const endTimer      = setTimeout(() => setIsLoading(false), 8800);

        return () => {
            clearTimeout(logoHoldTimer);
            clearTimeout(flipTimer);
            clearTimeout(holdTimer);
            clearTimeout(zoomTimer);
            clearTimeout(endTimer);
        };
    }, []);

    // --- VARIANTS ---

    const logoVariant: Variants = {
        logo: {
            scale: 1,
            opacity: 1,
            rotateY: 0,
            filter: "brightness(1)",
            transition: { duration: 0 }
        },
        "logo-hold": {
            scale: 1,
            rotateY: 0,
            opacity: 1,
            filter: "brightness(1)",
            transition: { duration: 0.5 }
        },
        flip: {
            rotateY: 90,
            scale: 1.1,
            opacity: 0,
            filter: "brightness(2)",
            transition: { duration: 0.5, ease: "easeIn" }
        }
    };

    const tkxVariant: Variants = {
        initial: {
            rotateY: -90,
            scale: 1.1,
            opacity: 0,
            filter: "brightness(2)"
        },
        flip: {
            rotateY: 0,
            scale: 1,
            opacity: 1,
            filter: "brightness(1)",
            transition: { duration: 0.5, ease: "easeOut", delay: 0.5 }
        },
        hold: {
            rotateY: 0,
            scale: 1,
            opacity: 1,
            filter: "brightness(1)",
            transition: { duration: 0.5 }
        },
        // --- CINEMATIC ZOOM THROUGH ---
        "zoom-through": {
            rotateY: 0,
            scale: 50,             // Massive scale to "fly through" the X
            opacity: 0,            // Fades out only at the very end
            filter: "blur(4px)",   // Adds motion blur for speed
            transition: { 
                duration: 1.2,     
                ease: [0.7, 0, 0.84, 0] // "Expo In" curve: Starts slow, snaps fast
            }
        }
    };

    const showLogo = stage === "logo" || stage === "logo-hold" || stage === "flip";
    const showTkx = stage === "flip" || stage === "hold" || stage === "zoom-through";
    
    // Helper to detect if we are in the final stage
    const isZooming = stage === "zoom-through";

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div 
                    key="loader-overlay"
                    className="fixed inset-0 flex items-center justify-center z-[9999] overflow-hidden"
                    // Instant unmount because we manually fade the background below
                    exit={{ opacity: 0, transition: { duration: 0 } }} 
                >
                    {/* BACKGROUND LAYER: 
                      Fades to transparent slightly BEFORE the X is finished zooming.
                      This ensures the X appears to zoom *over* your video content.
                    */}
                    <motion.div 
                        className="absolute inset-0 bg-black"
                        animate={{ opacity: isZooming ? 0 : 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeIn" }}
                    />
                    
                    <motion.div
                        className="absolute inset-0"
                        animate={{ opacity: isZooming ? 0 : 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeIn" }}
                        style={{
                            background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%)"
                        }}
                    />

                    {/* PARTICLES (Fade out cleanly before zoom hits) */}
                    <motion.div 
                        className="absolute inset-0 pointer-events-none overflow-hidden"
                        animate={{ opacity: isZooming ? 0 : 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {[...Array(35)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full"
                                style={{
                                    width: Math.random() * 3 + 1 + "px",
                                    height: Math.random() * 3 + 1 + "px",
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

                    <div
                        className="relative w-[600px] h-[600px] flex items-center justify-center"
                        style={{ perspective: "1000px" }}
                    >
                        {/* LOGO */}
                        <AnimatePresence>
                            {showLogo && (
                                <motion.div
                                    key="logo-container"
                                    className="absolute flex items-center justify-center z-10"
                                    variants={logoVariant}
                                    initial="logo"
                                    animate={stage}
                                    style={{ backfaceVisibility: "hidden" }}
                                >
                                    <motion.img
                                        src="/tk-logo-animated.svg"
                                        alt="Takshashila Logo"
                                        className="w-72 h-72 object-contain relative z-20"
                                        style={{
                                            mixBlendMode: "screen",
                                            filter: "contrast(1.3) brightness(0.9)",
                                            transform: "translateZ(0)"
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* TKX - ZOOM THROUGH */}
                        {showTkx && (
                            <motion.div
                                key="tkx-container"
                                className="absolute flex items-center justify-center z-10 pointer-events-none"
                                variants={tkxVariant}
                                initial="initial"
                                animate={stage}
                                style={{ backfaceVisibility: "hidden" }}
                            >
                                <motion.img
                                    src="/tk-goldx-bgremoved.png" 
                                    alt="TKX"
                                    className="w-[400px] object-contain"
                                    style={{
                                        transform: "translateZ(0)",
                                        willChange: "transform, opacity"
                                    }}
                                />
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}