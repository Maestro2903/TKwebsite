"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export const Tooltip = ({
  content,
  children,
  containerClassName,
}: {
  content: string | React.ReactNode;
  children: React.ReactNode;
  containerClassName?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = () => {
    if (!contentRef.current || !containerRef.current) return { x: 0, y: 0 };

    const tooltip = contentRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get tooltip dimensions
    const tooltipWidth = tooltipRect.width || 320;
    const tooltipHeight = tooltipRect.height || 100;

    // Default: position below the element, centered
    let finalX =
      containerRect.left + containerRect.width / 2 - tooltipWidth / 2;
    let finalY = containerRect.bottom + 8;

    // Check if tooltip goes beyond right edge
    if (finalX + tooltipWidth > viewportWidth - 16) {
      finalX = viewportWidth - tooltipWidth - 16;
    }

    // Check if tooltip goes beyond left edge
    if (finalX < 16) {
      finalX = 16;
    }

    // Check if tooltip goes beyond bottom edge - position above instead
    if (finalY + tooltipHeight > viewportHeight - 16) {
      finalY = containerRect.top - tooltipHeight - 8;
    }

    // Check if tooltip goes beyond top edge
    if (finalY < 16) {
      finalY = containerRect.bottom + 8;
    }

    return { x: finalX, y: finalY };
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const handleTouchStart = () => {
    setIsVisible(true);
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      setIsVisible(false);
    }, 2000);
  };

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (window.matchMedia("(hover: none)").matches) {
      e.preventDefault();
      setIsVisible(!isVisible);
    }
  };

  useEffect(() => {
    if (isVisible && contentRef.current) {
      const newPosition = calculatePosition();
      setPosition(newPosition);
    }
  }, [isVisible]);

  return (
    <>
      <span
        ref={containerRef}
        className={cn("relative inline-block", containerClassName)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        {children}
      </span>
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isVisible && (
              <motion.div
                key="tooltip"
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{
                  duration: 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="pointer-events-none fixed z-[9999] max-w-xs rounded-lg border border-neutral-200/50 bg-white/95 px-3 py-2 text-sm leading-relaxed text-neutral-700 shadow-lg backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-800/95 dark:text-neutral-300"
                style={{
                  top: position.y,
                  left: position.x,
                }}
              >
                <div ref={contentRef}>{content}</div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};
