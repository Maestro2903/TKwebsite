'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import type { RegistrationPass } from '@/data/passes';
import { AwardBadge } from '@/components/decorative/AwardBadge';
import { cn } from '@/lib/utils';

interface PassCardProps {
  pass: RegistrationPass;
  onRegister?: (pass: RegistrationPass) => void;
}

/** M-Ticket style card for SANA / All-Access pass */
function MTicketCard({ pass, onRegister }: PassCardProps) {
  const [rawPrice] = pass.price.split('/').map((s) => s.trim());
  const parsedPrice = rawPrice.replace(/[₹\s]/g, '');

  return (
    <div className="pass-card-m-ticket relative w-full max-w-[350px] sm:w-[350px] bg-white rounded-xl overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.15)] flex flex-col items-stretch select-none transition-shadow duration-200 hover:shadow-[0_0_30px_rgba(0,0,0,0.2)]">
      {/* Side circles (ticket perforation) */}
      <span
        className="absolute left-0 top-[41%] -translate-x-1/2 w-4 h-4 rounded-full bg-[#e5e5e5] shadow-[inset_0_0_12px_rgba(0,0,0,0.12)] z-10"
        aria-hidden
      />
      <span
        className="absolute right-0 top-[41%] translate-x-1/2 w-4 h-4 rounded-full bg-[#e5e5e5] shadow-[inset_0_0_12px_rgba(0,0,0,0.12)] z-10"
        aria-hidden
      />

      {/* Rotated label - E-Ticket */}
      <p
        className="absolute -right-1 top-[15%] -rotate-90 origin-center text-[0.75rem] text-neutral-400 font-medium uppercase tracking-wider whitespace-nowrap z-10"
        aria-hidden
      >
        E-Ticket
      </p>

      {/* Event details = poster + info */}
      <div className="flex gap-3 sm:gap-4 p-4 sm:p-5 pb-3 sm:pb-4">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100 shadow-md">
          <Image
            src="/assets/images/sana-arena-bg.webp"
            alt="SANA Arena"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 80px, 112px"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight mb-1">
            TAKSHASHILA 2026
          </h4>
          <p className="text-xs sm:text-sm font-semibold text-neutral-700 mb-1.5 sm:mb-2">SANA Arena • All-Access Pass</p>
          <p className="text-[10px] sm:text-xs text-neutral-600 leading-snug mb-1 sm:mb-1.5">
            <strong className="text-neutral-800">This premium pass gives you access to all three days of TAKSHASHILA with:</strong>
          </p>
          <ul className="text-[10px] sm:text-xs font-bold text-neutral-700 space-y-0.5">
            <li>• CIDA</li>
            <li>• SANA Arena</li>
            <li>• Day 3 concert</li>
          </ul>
        </div>
      </div>

      {/* Info strip */}
      <div className="mx-[7%] rounded-2xl bg-neutral-100 py-2 sm:py-2.5 text-center text-[0.65rem] sm:text-[0.7rem] text-neutral-600">
        Tap to register or view details
      </div>

      {/* Ticket details = QR + pass info */}
      <div className="flex gap-3 sm:gap-4 p-4 sm:p-5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded border-2 border-dashed border-neutral-300 flex items-center justify-center bg-neutral-50">
          <span className="text-[0.55rem] sm:text-[0.6rem] text-neutral-400 text-center px-1">QR at entry</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center min-w-0">
          <p className="text-[10px] sm:text-xs text-neutral-600">1 Pass</p>
          <b className="mt-1 sm:mt-1.5 block text-sm sm:text-base font-semibold text-neutral-800">ALL-ACCESS PASS</b>
          <p className="text-[10px] sm:text-xs text-neutral-600 mt-0.5 sm:mt-1">CIDA • SANA Arena • Day 3</p>
          <h6 className="mt-1.5 sm:mt-2 text-[0.65rem] sm:text-[0.7rem] font-normal text-neutral-500 uppercase tracking-wide">
            Register to get your pass
          </h6>
        </div>
      </div>

      {/* Info / policy */}
      <div className="w-full bg-neutral-100 text-neutral-500 py-2 sm:py-2.5 text-center text-[0.7rem] sm:text-xs">
        Valid for all 3 days • Non-transferable
      </div>

      {/* Total amount + CTA */}
      <div className="flex flex-col gap-2.5 sm:gap-3 p-3 sm:p-4 pt-2.5 sm:pt-3">
        <div className="flex justify-between items-center font-bold text-xs sm:text-sm">
          <span className="text-neutral-700">Total Amount</span>
          <span className="text-neutral-900">₹{parsedPrice}</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRegister?.(pass);
          }}
          className="w-full py-3 sm:py-3.5 px-4 sm:px-6 bg-neutral-300 hover:bg-neutral-400 active:bg-neutral-500 text-[#000000] font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-all duration-200 ease-out cursor-pointer touch-manipulation"
        >
          REGISTER
        </button>
      </div>
    </div>
  );
}

export default function PassCard({ pass, onRegister }: PassCardProps) {
  if (pass.passType === 'sana_concert') {
    return <MTicketCard pass={pass} onRegister={onRegister} />;
  }

  const actionLabel = pass.passType === 'group_events' ? 'CREATE TEAM' : 'REGISTER';
  const [rawPrice, rawUnit] = pass.price.split('/').map((s) => s.trim());
  const parsedPrice = rawPrice.replace(/[₹\s]/g, '');
  const parsedUnit = rawUnit || null;

  return (
    <div className="relative w-full aspect-[2/3] max-w-[360px] mx-auto bg-[#1a1a1a] border border-neutral-800 shadow-2xl flex flex-col overflow-hidden select-none group cursor-pointer transition-all duration-300 hover:border-neutral-600">
      <div className="h-6 w-full flex items-center justify-between px-2 border-b border-neutral-700 bg-[#151515] relative z-10 min-h-0 shrink-0">
        <X size={10} className="text-neutral-500 shrink-0" />
        <div className="flex gap-2 sm:gap-4 text-[8px] tracking-[0.2em] text-neutral-600 uppercase font-bold min-w-0 overflow-hidden">
          <span>Registration</span>
          <span>///</span>
          <span>Pass System</span>
        </div>
        <X size={10} className="text-neutral-500 shrink-0" />
      </div>

      <div className="flex-1 relative flex min-h-0">
        <div className="w-8 h-full flex flex-col items-center justify-center gap-16 border-r border-neutral-800 bg-[#151515]">
          <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
        </div>

        <div className="flex-1 flex flex-col p-0 pb-0 bg-[#1a1a1a] relative min-w-0">
          <div className="relative w-full flex-1 flex flex-col min-h-0">
            <div
              className="aspect-[16/10] w-full flex-shrink-0 bg-[#050505] border border-neutral-700 relative overflow-hidden group-hover:border-neutral-500 transition-colors duration-300"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 92% 100%, 8% 100%, 0 88%)' }}
            >
              <div className="absolute inset-0 z-0 flex items-center justify-center">
                <div className="w-full h-full p-4 overflow-hidden relative">
                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center gap-4">
                    <div className="px-3 py-1 border border-neutral-700 bg-neutral-900/80">
                      <span className="text-[9px] text-neutral-400 tracking-[0.15em] uppercase font-bold">
                        {pass.passType === 'group_events' ? 'Team Access' : 'Individual Access'}
                      </span>
                    </div>
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
                    <p className="text-[10px] text-neutral-400 leading-relaxed max-w-[200px] line-clamp-3">
                      {pass.details}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="absolute inset-0 border-[0.5px] border-neutral-800 m-0.5 opacity-50 z-10 pointer-events-none"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 88%, 92% 100%, 8% 100%, 0 88%)' }}
              />
            </div>
            <div className="absolute bottom-0 w-full h-8 pointer-events-none">
              <div className="absolute bottom-[12%] left-0 w-2 h-[1px] bg-neutral-500" />
              <div className="absolute bottom-[12%] right-0 w-2 h-[1px] bg-neutral-500" />
            </div>
          </div>

          <div className="h-auto mt-2 flex flex-col min-w-0">
            <div className="min-h-[96px] bg-[#151515] border border-neutral-800 mt-2 p-3 flex flex-col gap-3 relative overflow-hidden group-hover:border-neutral-600 transition-colors shrink-0">
              <h2
                className={cn(
                  'font-orbitron font-bold tracking-tighter text-neutral-300 line-clamp-2 leading-tight pr-2 z-10 min-w-0 break-words',
                  pass.title.length > 40 ? 'text-xs' : pass.title.length > 28 ? 'text-sm' : pass.title.length > 18 ? 'text-base' : 'text-base sm:text-lg'
                )}
              >
                {pass.title}
              </h2>
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
              <div className="absolute top-0 right-0 p-1 pointer-events-none">
                <div className="w-2 h-2 border-t border-r border-neutral-500" />
              </div>
              <div className="absolute bottom-0 left-0 p-1 pointer-events-none">
                <div className="w-2 h-2 border-b border-l border-neutral-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-8 h-full flex flex-col items-center justify-center gap-16 border-l border-neutral-800 bg-[#151515]">
          <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
        </div>
      </div>

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
