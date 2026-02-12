'use client';

import React from 'react';
import Image from 'next/image';
import { AwardBadge } from '@/components/decorative/AwardBadge';

interface SciFiCardProps {
    name: string;
    description?: string;
    /** When set, shown on the card instead of description (e.g. full paragraph); card uses scrollable area */
    fullDescription?: string;
    image?: string;
    onClick?: () => void;
    /** When set, footer shows AwardBadge "Register" button linking here */
    registerHref?: string;
    /** Custom action handler (alternative to registerHref) */
    onAction?: () => void;
    /** Label for the action button (default: "Register") */
    actionLabel?: string;
    /** Secondary action handler (e.g. "Know More" - shown alongside registerHref when both set) */
    onSecondaryAction?: () => void;
    /** Label for the secondary action button (default: "Know More") */
    secondaryActionLabel?: string;
    className?: string;
    children?: React.ReactNode;
}

const SciFiCard: React.FC<SciFiCardProps> = ({
    name,
    description,
    image,
    onClick,
    registerHref,
    onAction,
    actionLabel = "Register",
    onSecondaryAction,
    secondaryActionLabel = "Know More",
    className = '',
    children
}) => {
    return (
        <div
            onClick={onClick}
            className={`sci-fi-card relative w-full h-full flex flex-col overflow-hidden select-none group cursor-pointer bg-[#050509]/90 border border-white/10 shadow-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-white/20 ${className}`}
        >
            <div className="sci-fi-card__display flex-1 flex flex-col bg-[#050509]/95 relative min-w-0">
                <div className="event-card__image relative w-full flex-shrink-0 overflow-hidden">
                    <div className="absolute inset-0 z-0 flex items-center justify-center">
                        {children ? (
                            <div className="w-full h-full p-4 overflow-hidden relative">
                                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center">
                                    {children}
                                </div>
                            </div>
                        ) : image ? (
                            <Image
                                src={image}
                                alt={name}
                                fill
                                className="object-cover w-full h-full opacity-90 transition-opacity duration-500 group-hover:opacity-100"
                                sizes="(max-width: 768px) 100vw, (max-width: 991px) 50vw, 33vw"
                            />
                        ) : null}
                    </div>
                    <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute inset-1 border border-white/10 z-10 pointer-events-none" />
                </div>

                <div className="event-content flex flex-col flex-1 min-h-0 gap-3 bg-[#050509]/95 border-t border-white/10 p-6">
                    <div className="event-content__header">
                        <h2 className="sci-fi-card__title font-orbitron font-semibold uppercase tracking-wide text-neutral-100 line-clamp-2 leading-tight text-sm sm:text-base min-w-0 break-normal">
                            {name}
                        </h2>
                    </div>

                    {description && (
                        <p className="event-content__description text-neutral-400 text-sm leading-relaxed line-clamp-3">
                            {description}
                        </p>
                    )}

                    {(registerHref || onAction || onSecondaryAction) && (
                        <div
                            className="event-cta event-cta-zone mt-auto pt-4 z-10 flex flex-row gap-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {onSecondaryAction && (
                                <AwardBadge
                                    className="event-cta__secondary flex-1 h-12 box-border border border-transparent flex items-center justify-center"
                                    onClick={onSecondaryAction}
                                >
                                    {secondaryActionLabel}
                                </AwardBadge>
                            )}
                            {registerHref && (
                                <AwardBadge
                                    className="event-cta__primary flex-1 h-12 box-border border border-transparent flex items-center justify-center"
                                    href={registerHref}
                                >
                                    {actionLabel}
                                </AwardBadge>
                            )}
                            {!registerHref && onAction && (
                                <AwardBadge
                                    className="event-cta__primary flex-1 h-12 box-border border border-transparent flex items-center justify-center"
                                    onClick={onAction}
                                >
                                    {actionLabel}
                                </AwardBadge>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SciFiCard;
