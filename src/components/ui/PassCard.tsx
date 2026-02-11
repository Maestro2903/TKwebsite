'use client';

import { Plus, X } from 'lucide-react';
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

  // Subtle accent colors per pass type
  const accentClasses = (() => {
    switch (pass.passType) {
      case 'day_pass':
        return {
          panelBorder: 'border-blue-900/40',
          dot: 'bg-blue-400/70',
        };
      case 'group_events':
        return {
          panelBorder: 'border-purple-900/40',
          dot: 'bg-purple-400/70',
        };
      case 'proshow':
        return {
          panelBorder: 'border-red-900/40',
          dot: 'bg-red-400/70',
        };
      case 'sana_concert':
        return {
          panelBorder: 'border-amber-900/40',
          dot: 'bg-amber-400/80',
        };
      default:
        return {
          panelBorder: 'border-neutral-800',
          dot: 'bg-neutral-500',
        };
    }
  })();

  return (
    <div className="relative w-full max-w-[360px] mx-auto bg-[#1a1a1a] border border-neutral-800 shadow-2xl flex flex-col overflow-hidden select-none group cursor-pointer transition-all duration-300 hover:border-neutral-600">
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

        {/* Central Zones */}
        <div className="flex-1 flex flex-col bg-[#1a1a1a] relative min-w-0 px-3 pt-3 pb-2">
          {/* HEADER ZONE */}
          <div className="bg-[#151515] border border-neutral-800/80 rounded-sm px-3 py-2 flex flex-col gap-1 relative overflow-hidden">
            {/* subtle scanline / grid */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            />

            <div className="flex items-center justify-between gap-2 relative z-10">
              <h2
                className={cn(
                  'font-orbitron font-bold tracking-tighter text-neutral-100 line-clamp-2 leading-tight min-w-0 break-words',
                  pass.title.length > 40
                    ? 'text-xs'
                    : pass.title.length > 28
                      ? 'text-sm'
                      : pass.title.length > 18
                        ? 'text-base'
                        : 'text-base sm:text-lg'
                )}
              >
                {pass.title}
              </h2>

              {/* Type Badge */}
              <div className={cn(
                'px-2 py-1 border text-[8px] tracking-[0.15em] uppercase font-bold bg-neutral-900/90',
                accentClasses.panelBorder,
              )}>
                <span className="text-neutral-300">
                  {pass.passType === 'group_events' ? 'Team Access' : 'Individual Access'}
                </span>
              </div>
            </div>

            {/* Small id / code row */}
            <div className="mt-1 text-[9px] font-mono text-neutral-500 flex justify-between relative z-10">
              <span>PASS-ID: {pass.id.toUpperCase()}</span>
              <span>CIT / 2026</span>
            </div>

            {/* Corner accents */}
            <div className="absolute top-0 right-0 p-1 pointer-events-none">
              <div className="w-2 h-2 border-t border-r border-neutral-500" />
            </div>
            <div className="absolute bottom-0 left-0 p-1 pointer-events-none">
              <div className="w-2 h-2 border-b border-l border-neutral-500" />
            </div>
          </div>

          {/* CENTRAL INFORMATION GRID */}
          <div className="mt-3 grid grid-rows-3 gap-2 flex-1">
            {/* Price panel */}
            <div className={cn(
              'relative bg-[#050505] border border-neutral-800 rounded-sm px-3 py-2 flex items-center justify-between overflow-hidden',
              accentClasses.panelBorder,
            )}>
              <div className="flex flex-col gap-0.5 z-10">
                <span className="text-[9px] tracking-[0.15em] uppercase text-neutral-500">Access Value</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-bold text-white font-orbitron tracking-tight">
                    ₹{parsedPrice}
                  </span>
                  {parsedUnit && (
                    <span className="text-[10px] text-neutral-400 font-mono tracking-wide">
                      / {parsedUnit}
                    </span>
                  )}
                </div>
              </div>

              {/* accent dot cluster */}
              <div className="flex flex-col items-end gap-1 z-10">
                <div className="flex gap-1">
                  <span className={cn('w-1.5 h-1.5 rounded-full', accentClasses.dot)} />
                  <span className="w-1 h-1 rounded-full bg-neutral-700" />
                  <span className="w-1 h-1 rounded-full bg-neutral-800" />
                </div>
                <span className="text-[8px] text-neutral-500 tracking-[0.2em] uppercase">Credit Line</span>
              </div>

              {/* grid texture */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)',
                  backgroundSize: '18px 18px',
                }}
              />
            </div>

            {/* Details panel */}
            <div className="relative bg-[#050505] border border-neutral-800 rounded-sm px-3 py-2 overflow-hidden">
              <div className="absolute inset-0 opacity-15 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(to bottom, transparent 0%, #111 50%, transparent 100%)' }}
              />
              <span className="text-[9px] tracking-[0.15em] uppercase text-neutral-500 block mb-1 z-10 relative">
                Description
              </span>
              <p className="text-[10px] text-neutral-300 leading-relaxed line-clamp-4 z-10 relative">
                {pass.details}
              </p>
            </div>

            {/* Meta / features panel */}
            {pass.meta && pass.meta.length > 0 && (
              <div className="relative bg-[#050505] border border-neutral-800 rounded-sm px-3 py-2 flex flex-col gap-1.5 overflow-hidden">
                <span className="text-[9px] tracking-[0.15em] uppercase text-neutral-500 z-10 relative">
                  Features
                </span>
                <div className="z-10 relative flex flex-col gap-1">
                  {pass.meta.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className={cn('w-1.5 h-1.5 rounded-full', accentClasses.dot)} />
                      <span className="text-[10px] text-neutral-300 truncate">{item}</span>
                    </div>
                  ))}
                </div>
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />
              </div>
            )}
          </div>

          {/* CONTROL PANEL ZONE */}
          <div className="mt-3 flex flex-col gap-2">
            {/* Dots grid + plus icons */}
            <div className="flex justify-between items-end">
              {/* Dots grid */}
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-1 h-1 rounded-full',
                      i < 3 ? 'bg-neutral-400' : 'bg-neutral-800',
                    )}
                  />
                ))}
              </div>

              {/* Plus icons */}
              <div className="flex gap-1">
                <Plus size={12} className="text-neutral-600" />
                <Plus size={12} className="text-neutral-600" />
                <Plus size={12} className="text-neutral-400" />
              </div>
            </div>

            {/* Ruler strip */}
            <div className="border-y border-neutral-800 py-1 flex justify-between items-center text-[8px] font-bold text-neutral-500 font-orbitron min-w-0 overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="opacity-50">{i + 1}</span>
                  <div className="w-[1px] h-1 bg-neutral-700" />
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER ACTION ZONE */}
          <div className="mt-3 bg-[#151515] border border-neutral-800 p-3 flex flex-col gap-2 relative overflow-hidden group-hover:border-neutral-600 transition-colors shrink-0">
            <div className="flex items-center justify-between gap-2 z-10 relative">
              <span className="text-[9px] tracking-[0.2em] uppercase text-neutral-500">
                Status: Active
              </span>
              <span className="text-[9px] text-neutral-500 font-mono">
                Tier • {pass.passType.toUpperCase()}
              </span>
            </div>

            <div className="mt-1 z-10 relative" onClick={(e) => e.stopPropagation()}>
              <AwardBadge onClick={() => onRegister?.(pass)}>{actionLabel}</AwardBadge>
            </div>

            {/* Corner accents */}
            <div className="absolute top-0 right-0 p-1 pointer-events-none">
              <div className="w-2 h-2 border-t border-r border-neutral-500" />
            </div>
            <div className="absolute bottom-0 left-0 p-1 pointer-events-none">
              <div className="w-2 h-2 border-b border-l border-neutral-500" />
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
