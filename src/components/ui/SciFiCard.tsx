'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, X } from 'lucide-react';
import { AwardBadge } from '@/components/decorative/AwardBadge';
import { cn } from '@/lib/utils';

interface SciFiCardProps {
    name: string;
    description?: string;
    image: string;
    onClick?: () => void;
    /** When set, footer shows AwardBadge "Register" button linking here */
    registerHref?: string;
    className?: string;
}

const SciFiCard: React.FC<SciFiCardProps> = ({ name, description, image, onClick, registerHref, className = '' }) => {
    return (
        <div
            onClick={onClick}
            className={`sci-fi-card relative w-full aspect-[2/3] bg-[#1a1a1a] border border-neutral-800 shadow-2xl flex flex-col overflow-hidden select-none group cursor-pointer transition-all duration-300 hover:border-neutral-600 ${className}`}
        >
            {/* --- Top Border Strip --- */}
            <div className="h-6 w-full flex items-center justify-between px-2 border-b border-neutral-700 bg-[#151515] relative z-10 min-h-0 shrink-0">
                <X size={10} className="text-neutral-500 shrink-0" />
                <div className="flex gap-2 sm:gap-4 text-[8px] tracking-[0.2em] text-neutral-600 uppercase font-bold min-w-0 overflow-hidden">
                    <span>System Cover</span>
                    <span>///</span>
                    <span>Data Link</span>
                    <span>///</span>
                    <span>Secure</span>
                </div>
                <X size={10} className="text-neutral-500 shrink-0" />
            </div>

            {/* --- Main Content Area --- */}
            <div className="flex-1 relative flex min-h-0">
                {/* Left Vertical Rail */}
                <div className="w-8 h-full flex flex-col items-center justify-center gap-16 border-r border-neutral-800 bg-[#151515]">
                    <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
                    <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
                    <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
                </div>

                {/* Central Display Zone — no padding so image fills fully on all screen sizes */}
                <div className="sci-fi-card__display flex-1 flex flex-col p-0 pb-0 bg-[#1a1a1a] relative min-w-0">

                    {/* Inner Screen Container */}
                    <div className="relative w-full flex-1 flex flex-col min-h-0">

                        {/* The Screen (Void / Image) — aspect-ratio so poster proportions stay same on all devices */}
                        <div className="aspect-[16/10] w-full flex-shrink-0 bg-[#050505] border border-neutral-700 relative overflow-hidden group-hover:border-neutral-500 transition-colors duration-300"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 92% 100%, 8% 100%, 0 88%)' }}>

                            {/* Image Container */}
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src={image}
                                    alt={name}
                                    fill
                                    className="object-cover opacity-80 transition-opacity duration-500"
                                />
                            </div>

                            {/* Inner Decorative Lines — minimal margin so image fills the screen on all sizes */}
                            <div className="absolute inset-0 border-[0.5px] border-neutral-800 m-0.5 opacity-50 z-10 pointer-events-none"
                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 92% 100%, 8% 100%, 0 88%)' }}></div>

                            {/* Subtle Grid overlay inside screen */}
                            <div className="absolute inset-0 opacity-10 z-10 pointer-events-none"
                                style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                            </div>

                        </div>

                        {/* Screen Bottom Connectors (Visual) */}
                        <div className="absolute bottom-0 w-full h-8 pointer-events-none">
                            <div className="absolute bottom-[12%] left-0 w-2 h-[1px] bg-neutral-500"></div>
                            <div className="absolute bottom-[12%] right-0 w-2 h-[1px] bg-neutral-500"></div>
                        </div>
                    </div>

                    {/* Lower Control Panel */}
                    <div className="h-auto mt-2 flex flex-col gap-2 min-w-0">

                        {/* Row 1: Indicators */}
                        <div className="flex justify-between items-end pb-2">
                            {/* Dots Grid */}
                            <div className="grid grid-cols-4 gap-1">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className={`w-1 h-1 rounded-full ${i < 3 ? 'bg-neutral-400' : 'bg-neutral-800'}`}></div>
                                ))}
                            </div>

                            {/* Tech Line */}
                            <div className="h-1 bg-neutral-800 flex-1 mx-4 rounded-sm relative">
                                <div className="absolute left-0 top-0 h-full w-1/3 bg-neutral-600 group-hover:w-2/3 transition-all duration-500"></div>
                            </div>

                            {/* Cross Icons */}
                            <div className="flex gap-1">
                                <Plus size={12} className="text-neutral-600" />
                                <Plus size={12} className="text-neutral-600" />
                                <Plus size={12} className="text-neutral-400" />
                            </div>
                        </div>

                        {/* Row 2: Ruler Strip */}
                        <div className="border-y border-neutral-800 py-1 flex justify-between items-center text-[8px] font-bold text-neutral-500 font-orbitron min-w-0 overflow-hidden">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <span className="opacity-50">{i + 1}</span>
                                    <div className="w-[1px] h-1 bg-neutral-700"></div>
                                </div>
                            ))}
                        </div>

                        {/* Row 3: Footer — Event name + Register button */}
                        <div className="min-h-[96px] bg-[#151515] border border-neutral-800 mt-2 p-3 flex flex-col gap-3 relative overflow-hidden group-hover:border-neutral-600 transition-colors shrink-0">
                            <h2
                                className={cn(
                                    'sci-fi-card__title font-orbitron font-bold tracking-tighter text-neutral-300 line-clamp-2 leading-tight pr-2 z-10 min-w-0 break-words',
                                    // Mobile: smaller sizes so long names fit; desktop: same tiers, short names get text-lg
                                    name.length > 40
                                        ? 'text-xs'
                                        : name.length > 28
                                            ? 'text-sm'
                                            : name.length > 18
                                                ? 'text-base'
                                                : 'text-base sm:text-lg'
                                )}
                            >
                                {name}
                            </h2>
                            {registerHref && (
                                <div className="mt-auto z-10" onClick={(e) => e.stopPropagation()}>
                                    <AwardBadge href={registerHref}>Register</AwardBadge>
                                </div>
                            )}
                            {/* Corner Accents */}
                            <div className="absolute top-0 right-0 p-1 pointer-events-none">
                                <div className="w-2 h-2 border-t border-r border-neutral-500"></div>
                            </div>
                            <div className="absolute bottom-0 left-0 p-1 pointer-events-none">
                                <div className="w-2 h-2 border-b border-l border-neutral-500"></div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Right Vertical Rail */}
                <div className="w-8 h-full flex flex-col items-center justify-center gap-16 border-l border-neutral-800 bg-[#151515]">
                    <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
                    <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
                    <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
                </div>
            </div>

            {/* --- Bottom Border Strip --- */}
            <div className="h-6 w-full flex items-center justify-between px-2 border-t border-neutral-700 bg-[#151515] relative z-10">
                <X size={10} className="text-neutral-500" />
                <div className="flex gap-4 text-[8px] tracking-[0.2em] text-neutral-600 uppercase font-bold">
                    <span>Status: Active</span>
                </div>
                <X size={10} className="text-neutral-500" />
            </div>

        </div>
    );
};

export default SciFiCard;
