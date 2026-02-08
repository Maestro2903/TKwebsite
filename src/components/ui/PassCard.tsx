'use client';

import { X } from 'lucide-react';
import type { RegistrationPass } from '@/data/passes';
import { AwardBadge } from '@/components/decorative/AwardBadge';
import { cn } from '@/lib/utils';

interface PassCardProps {
  pass: RegistrationPass;
  onRegister?: (pass: RegistrationPass) => void;
}

export default function PassCard({ pass, onRegister }: PassCardProps) {
  const actionLabel = pass.passType === 'group_events' ? 'CREATE TEAM' : 'REGISTER';

  // Centralized price parsing - parse once, use everywhere
  const [rawPrice, rawUnit] = pass.price.split('/').map((s) => s.trim());
  const parsedPrice = rawPrice.replace(/[₹\s]/g, ''); // Strip currency symbol and whitespace
  const parsedUnit = rawUnit || null; // e.g., "person" from "₹250 / person"

  return (
    <div className="relative w-full aspect-[2/3] bg-[#1a1a1a] border border-neutral-800 shadow-2xl flex flex-col overflow-hidden select-none group cursor-pointer transition-all duration-300 hover:border-neutral-600">
      {/* Top Border Strip */}
      <div className="h-6 w-full flex items-center justify-between px-2 border-b border-neutral-700 bg-[#151515] relative z-10 min-h-0 shrink-0">
        <X size={10} className="text-neutral-500 shrink-0" />
        <div className="flex gap-2 sm:gap-4 text-[8px] tracking-[0.2em] text-neutral-600 uppercase font-bold min-w-0 overflow-hidden">
          <span>Registration</span>
          <span>///</span>
          <span>Pass System</span>
        </div>
        <X size={10} className="text-neutral-500 shrink-0" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex min-h-0">
        {/* Left Vertical Rail */}
        <div className="w-8 h-full flex flex-col items-center justify-center gap-16 border-r border-neutral-800 bg-[#151515]">
          <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
        </div>

        {/* Central Display Zone */}
        <div className="flex-1 flex flex-col p-0 pb-0 bg-[#1a1a1a] relative min-w-0">
          {/* Inner Screen Container */}
          <div className="relative w-full flex-1 flex flex-col min-h-0">
            {/* The Screen (Content Display) */}
            <div className="aspect-[16/10] w-full flex-shrink-0 bg-[#050505] border border-neutral-700 relative overflow-hidden group-hover:border-neutral-500 transition-colors duration-300"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 92% 100%, 8% 100%, 0 88%)' }}>
              
              {/* Content Container */}
              <div className="absolute inset-0 z-0 flex items-center justify-center">
                <div className="w-full h-full p-4 overflow-hidden relative">
                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center gap-4">
                    {/* Type Badge */}
                    <div className="px-3 py-1 border border-neutral-700 bg-neutral-900/80">
                      <span className="text-[9px] text-neutral-400 tracking-[0.15em] uppercase font-bold">
                        {pass.passType === 'group_events' ? 'Team Access' : 'Individual Access'}
                      </span>
                    </div>

                    {/* Price Display */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-4xl md:text-5xl font-bold text-white font-orbitron tracking-tighter">
                        ₹{parsedPrice}
                      </div>
                      {parsedUnit && (
                        <span className="text-[10px] text-neutral-500 font-mono tracking-wide">
                          / {parsedUnit}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <p className="text-[10px] text-neutral-400 leading-relaxed max-w-[200px] line-clamp-3">
                      {pass.details}
                    </p>
                  </div>
                </div>
              </div>

              {/* Inner Decorative Lines */}
              <div className="absolute inset-0 border-[0.5px] border-neutral-800 m-0.5 opacity-50 z-10 pointer-events-none"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 92% 100%, 8% 100%, 0 88%)' }}></div>
            </div>

            {/* Screen Bottom Connectors */}
            <div className="absolute bottom-0 w-full h-8 pointer-events-none">
              <div className="absolute bottom-[12%] left-0 w-2 h-[1px] bg-neutral-500"></div>
              <div className="absolute bottom-[12%] right-0 w-2 h-[1px] bg-neutral-500"></div>
            </div>
          </div>

          {/* Lower Control Panel */}
          <div className="h-auto mt-2 flex flex-col min-w-0">
            {/* Footer — Pass name + Register button */}
            <div className="min-h-[96px] bg-[#151515] border border-neutral-800 mt-2 p-3 flex flex-col gap-3 relative overflow-hidden group-hover:border-neutral-600 transition-colors shrink-0">
              <h2 className={cn(
                'font-orbitron font-bold tracking-tighter text-neutral-300 line-clamp-2 leading-tight pr-2 z-10 min-w-0 break-words',
                pass.title.length > 40
                  ? 'text-xs'
                  : pass.title.length > 28
                    ? 'text-sm'
                    : pass.title.length > 18
                      ? 'text-base'
                      : 'text-base sm:text-lg'
              )}>
                {pass.title}
              </h2>
              
              {/* Meta Info */}
              {pass.meta && pass.meta.length > 0 && (
                <div className="flex flex-col gap-1 opacity-60 z-10">
                  {pass.meta.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-neutral-500 rounded-full shrink-0" />
                      <span className="text-[9px] text-neutral-400 uppercase tracking-wide truncate">{item}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto z-10" onClick={(e) => e.stopPropagation()}>
                <AwardBadge onClick={() => onRegister?.(pass)}>{actionLabel}</AwardBadge>
              </div>

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

      {/* Bottom Border Strip */}
      <div className="h-6 w-full flex items-center justify-between px-2 border-t border-neutral-700 bg-[#151515] relative z-10">
        <X size={10} className="text-neutral-500" />
        <div className="flex gap-4 text-[8px] tracking-[0.2em] text-neutral-600 uppercase font-bold">
          <span>Status: Available</span>
        </div>
        <X size={10} className="text-neutral-500" />
      </div>
    </div>
  );
}
