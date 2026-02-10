'use client';

import React, { useMemo } from "react";
import Link from "next/link";

interface AwardBadgeProps {
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
    /** When set, renders as Next.js Link instead of button */
    href?: string;
    /** Gold solid button for checkout CTA (full-width, dark text, hover glow) */
    variant?: 'default' | 'gold-solid';
}

const badgeContent = (children: React.ReactNode, variant: AwardBadgeProps['variant']) => (
    variant === 'gold-solid' ? (children || "PROCEED TO SECURE PAYMENT") : (children || "REGISTER")
);

export const AwardBadge = ({ children, className = "", onClick, type = 'button', disabled = false, variant = 'default', href }: AwardBadgeProps) => {
    const id = useMemo(() => Math.random().toString(36).substr(2, 9), []);
    const buttonGradientId = `buttonGradient-${id}`;
    const glowId = `glow-${id}`;
    const rainbowGradientId = `rainbowGradient-${id}`;
    const coloredBlurId = `coloredBlur-${id}`;

    if (variant === 'gold-solid') {
        return (
            <button
                type={type}
                disabled={disabled}
                className={`award-badge-simple award-badge-simple--gold-solid w-full py-3.5 px-6 font-bold text-sm uppercase tracking-wider text-[#1a1a1a] transition-all duration-250 ease-out rounded-none border-0 cursor-pointer overflow-hidden ${className}`}
                onClick={onClick}
            >
                {children || "PROCEED TO SECURE PAYMENT"}
            </button>
        );
    }
    if (href) {
        return (
            <Link
                href={href}
                className={`award-badge-simple group relative block w-full h-auto cursor-pointer overflow-hidden ${className}`}
            >
                <div className="award-badge-simple__bg">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 54" className="w-full h-auto">
                        <defs>
                            <linearGradient id={buttonGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f3e3ac" />
                                <stop offset="50%" stopColor="#ddd" />
                                <stop offset="100%" stopColor="#f1cfa6" />
                            </linearGradient>
                            <filter id={glowId}>
                                <feGaussianBlur stdDeviation="4" result={coloredBlurId} />
                                <feMerge>
                                    <feMergeNode in={coloredBlurId} />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <rect width="260" height="54" fill={`url(#${buttonGradientId})`} />
                        <rect x="4" y="4" width="252" height="46" fill="transparent" stroke="#bbb" strokeWidth="1" />
                        <g className="award-badge-simple__rainbow" opacity="0">
                            <rect width="260" height="54" fill={`url(#${rainbowGradientId})`} />
                        </g>
                        <defs>
                            <linearGradient id={rainbowGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="hsl(358, 100%, 62%)" stopOpacity="0.3">
                                    <animate attributeName="stop-color"
                                        values="hsl(358, 100%, 62%); hsl(30, 100%, 50%); hsl(60, 100%, 50%); hsl(96, 100%, 50%); hsl(233, 85%, 47%); hsl(271, 85%, 47%); hsl(358, 100%, 62%)"
                                        dur="3s"
                                        repeatCount="indefinite" />
                                </stop>
                                <stop offset="50%" stopColor="hsl(60, 100%, 50%)" stopOpacity="0.3">
                                    <animate attributeName="stop-color"
                                        values="hsl(60, 100%, 50%); hsl(96, 100%, 50%); hsl(233, 85%, 47%); hsl(271, 85%, 47%); hsl(358, 100%, 62%); hsl(30, 100%, 50%); hsl(60, 100%, 50%)"
                                        dur="3s"
                                        repeatCount="indefinite" />
                                </stop>
                                <stop offset="100%" stopColor="hsl(233, 85%, 47%)" stopOpacity="0.3">
                                    <animate attributeName="stop-color"
                                        values="hsl(233, 85%, 47%); hsl(271, 85%, 47%); hsl(358, 100%, 62%); hsl(30, 100%, 50%); hsl(60, 100%, 50%); hsl(96, 100%, 50%); hsl(233, 85%, 47%)"
                                        dur="3s"
                                        repeatCount="indefinite" />
                                </stop>
                            </linearGradient>
                        </defs>
                        <foreignObject x="0" y="0" width="260" height="54">
                            <div className="flex items-center justify-center w-full h-full px-4">
                                <span className="award-badge-simple__text text-[#666] font-bold text-sm uppercase tracking-wider transition-colors duration-300">
                                    {badgeContent(children, variant)}
                                </span>
                            </div>
                        </foreignObject>
                    </svg>
                </div>
            </Link>
        );
    }
    return (
        <button
            type={type}
            disabled={disabled}
            className={`award-badge-simple group relative block w-full h-auto cursor-pointer overflow-hidden ${className}`}
            onClick={onClick}
        >
            {/* Background with gradient */}
            <div className="award-badge-simple__bg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 54" className="w-full h-auto">
                    <defs>
                        <linearGradient id={buttonGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f3e3ac" />
                            <stop offset="50%" stopColor="#ddd" />
                            <stop offset="100%" stopColor="#f1cfa6" />
                        </linearGradient>
                        <filter id={glowId}>
                            <feGaussianBlur stdDeviation="4" result={coloredBlurId} />
                            <feMerge>
                                <feMergeNode in={coloredBlurId} />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Main background - sharp edges */}
                    <rect width="260" height="54" fill={`url(#${buttonGradientId})`} />

                    {/* Border - sharp edges */}
                    <rect x="4" y="4" width="252" height="46" fill="transparent" stroke="#bbb" strokeWidth="1" />

                    {/* Animated rainbow overlay - only visible on hover */}
                    <g className="award-badge-simple__rainbow" opacity="0">
                        <rect width="260" height="54" fill={`url(#${rainbowGradientId})`} />
                    </g>

                    <defs>
                        <linearGradient id={rainbowGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="hsl(358, 100%, 62%)" stopOpacity="0.3">
                                <animate attributeName="stop-color"
                                    values="hsl(358, 100%, 62%); hsl(30, 100%, 50%); hsl(60, 100%, 50%); hsl(96, 100%, 50%); hsl(233, 85%, 47%); hsl(271, 85%, 47%); hsl(358, 100%, 62%)"
                                    dur="3s"
                                    repeatCount="indefinite" />
                            </stop>
                            <stop offset="50%" stopColor="hsl(60, 100%, 50%)" stopOpacity="0.3">
                                <animate attributeName="stop-color"
                                    values="hsl(60, 100%, 50%); hsl(96, 100%, 50%); hsl(233, 85%, 47%); hsl(271, 85%, 47%); hsl(358, 100%, 62%); hsl(30, 100%, 50%); hsl(60, 100%, 50%)"
                                    dur="3s"
                                    repeatCount="indefinite" />
                            </stop>
                            <stop offset="100%" stopColor="hsl(233, 85%, 47%)" stopOpacity="0.3">
                                <animate attributeName="stop-color"
                                    values="hsl(233, 85%, 47%); hsl(271, 85%, 47%); hsl(358, 100%, 62%); hsl(30, 100%, 50%); hsl(60, 100%, 50%); hsl(96, 100%, 50%); hsl(233, 85%, 47%)"
                                    dur="3s"
                                    repeatCount="indefinite" />
                            </stop>
                        </linearGradient>
                    </defs>

                    {/* Text content */}
                    <foreignObject x="0" y="0" width="260" height="54">
                        <div className="flex items-center justify-center w-full h-full px-4">
                            <span className="award-badge-simple__text text-[#666] font-bold text-sm uppercase tracking-wider transition-colors duration-300">
                                {children || "REGISTER"}
                            </span>
                        </div>
                    </foreignObject>
                </svg>
            </div>
        </button>
    );
};
