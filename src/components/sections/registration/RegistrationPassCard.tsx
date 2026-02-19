'use client';

import { memo } from 'react';
import { X } from 'lucide-react';
import { AwardBadge } from '@/components/decorative/AwardBadge';
import { cn } from '@/lib/utils';

interface RegistrationPassCardProps {
  id: string;
  name: string;
  description: string;
  price: number | string;
  priceLabel?: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick?: () => void;
  /** When true, render as radio option: no button CTA, show radio indicator. Use inside label with hidden input. */
  variant?: 'card' | 'radio';
  /** Show "Most Popular" badge */
  isMostPopular?: boolean;
}

function RegistrationPassCard({
  id,
  name,
  description,
  price,
  priceLabel,
  icon,
  isSelected,
  onClick,
  variant = 'card',
  isMostPopular = false,
}: RegistrationPassCardProps) {
  const isRadio = variant === 'radio';
  
  const content = (
    <div className={cn(
      "relative w-full h-full bg-[#1a1a1a] border border-neutral-800 shadow-2xl flex flex-col overflow-hidden select-none group transition-all duration-300",
      isSelected && "border-blue-500 shadow-blue-500/20",
      !isRadio && "cursor-pointer hover:border-neutral-600",
      isMostPopular && "border-amber-500/50"
    )}>
      {/* Top Border Strip */}
      <div className="h-8 w-full flex items-center justify-between px-3 border-b border-neutral-700 bg-[#151515] relative z-10 shrink-0">
        <X size={10} className="text-neutral-500 shrink-0" />
        <div className="flex gap-2 text-[8px] tracking-[0.2em] text-neutral-600 uppercase font-bold overflow-hidden">
          <span>Registration</span>
          <span>///</span>
          <span>Pass</span>
        </div>
        <X size={10} className="text-neutral-500 shrink-0" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex min-h-0">
        {/* Left Vertical Rail */}
        <div className="w-6 h-full flex flex-col items-center justify-center gap-12 border-r border-neutral-800 bg-[#151515]">
          <div className="w-2 h-2 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          <div className={cn(
            "w-2 h-2 rounded-full border shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] transition-all duration-300",
            isSelected ? "bg-blue-500/30 border-blue-500" : "bg-[#0a0a0a] border-neutral-700"
          )} />
          <div className="w-2 h-2 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
        </div>

        {/* Central Display Zone */}
        <div className="flex-1 flex flex-col p-0 bg-[#1a1a1a] relative min-w-0">
          {/* Icon Display Area */}
          {!isRadio && (
            <div className="aspect-container relative w-full aspect-[4/3] lg:aspect-[3/2] xl:h-[clamp(160px,18vw,240px)] max-h-[260px] bg-[#050505] border border-neutral-700 overflow-hidden group-hover:border-neutral-500 transition-colors duration-300 flex items-center justify-center"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 10% 100%, 0 85%)' }}>
              
              {/* Icon Content */}
              <div className="absolute inset-0 z-0 flex items-center justify-center p-6">
                <div className="text-neutral-400 group-hover:text-neutral-300 transition-colors duration-500">
                  {icon}
                </div>
              </div>

              {/* Inner Decorative Lines */}
              <div className="absolute inset-0 border-[0.5px] border-neutral-800 m-1 opacity-50 z-10 pointer-events-none"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 10% 100%, 0 85%)' }}></div>
            </div>
          )}

          {/* Lower Control Panel */}
          <div className="registration-pass-lower h-auto mt-3 flex flex-col gap-3 px-3 pb-3 min-w-0">
            {/* Content Card */}
            <div className={cn(
              "content-block min-h-[140px] bg-[#151515] border mt-2 p-4 flex flex-col gap-3 relative overflow-hidden transition-colors duration-300",
              isSelected ? "border-blue-500/50" : "border-neutral-800 group-hover:border-neutral-600"
            )}>
              {/* Header with Title and Badge */}
              <div className="flex items-start justify-between gap-2 z-10">
                <h3 className="font-orbitron font-bold tracking-tight text-neutral-300 text-base leading-tight flex-1">
                  {name}
                </h3>
                {isMostPopular && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[9px] font-bold uppercase tracking-wider">
                    Popular
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-neutral-400 text-sm leading-relaxed z-10 flex-1">
                {description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 z-10">
                <span className="text-3xl font-bold text-white font-orbitron tracking-tight">₹{price}</span>
                {priceLabel && (
                  <span className="text-sm text-neutral-500">{priceLabel}</span>
                )}
              </div>

              {/* CTA or Radio Indicator */}
              {isRadio ? (
                <div className="flex items-center justify-center mt-2 z-10">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                    isSelected ? "border-blue-500 bg-blue-500/20" : "border-neutral-600 bg-neutral-900"
                  )}>
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all duration-300",
                      isSelected ? "bg-blue-500" : "bg-transparent"
                    )} />
                  </div>
                </div>
              ) : (
                <div className="mt-auto z-10" onClick={(e) => e.stopPropagation()}>
                  <AwardBadge onClick={onClick}>{isSelected ? 'SELECTED' : 'SELECT'}</AwardBadge>
                </div>
              )}

              {/* Corner Accents */}
              <div className="absolute top-0 right-0 p-1 pointer-events-none">
                <div className={cn(
                  "w-3 h-3 border-t border-r transition-colors duration-300",
                  isSelected ? "border-blue-500" : "border-neutral-500"
                )}></div>
              </div>
              <div className="absolute bottom-0 left-0 p-1 pointer-events-none">
                <div className={cn(
                  "w-3 h-3 border-b border-l transition-colors duration-300",
                  isSelected ? "border-blue-500" : "border-neutral-500"
                )}></div>
              </div>

              {/* Subtle Glow Effect for Selected State */}
              {isSelected && (
                <div className="absolute inset-0 bg-blue-500/5 pointer-events-none z-0" />
              )}
            </div>
          </div>
        </div>

        {/* Right Vertical Rail */}
        <div className="w-6 h-full flex flex-col items-center justify-center gap-12 border-l border-neutral-800 bg-[#151515]">
          <div className="w-2 h-2 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          <div className={cn(
            "w-2 h-2 rounded-full border shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] transition-all duration-300",
            isSelected ? "bg-blue-500/30 border-blue-500" : "bg-[#0a0a0a] border-neutral-700"
          )} />
          <div className="w-2 h-2 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
        </div>
      </div>

      {/* Bottom Border Strip */}
      <div className="h-8 w-full flex items-center justify-between px-3 border-t border-neutral-700 bg-[#151515] relative z-10 shrink-0">
        <X size={10} className="text-neutral-500" />
        <div className="flex gap-2 text-[8px] tracking-[0.2em] uppercase font-bold">
          <span className={cn(
            "transition-colors duration-300",
            isSelected ? "text-blue-400" : "text-neutral-600"
          )}>
            Status: {isSelected ? 'Selected' : 'Available'}
          </span>
        </div>
        <X size={10} className="text-neutral-500" />
      </div>
    </div>
  );

  if (isRadio) {
    return <span className="registration-pass-card registration-pass-card--radio">{content}</span>;
  }

  return (
    <article
      className="registration-pass-card h-full max-h-[95vh]"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      aria-pressed={isSelected}
    >
      {content}
    </article>
  );
}

export default memo(RegistrationPassCard);
