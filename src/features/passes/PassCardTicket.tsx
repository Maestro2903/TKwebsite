'use client';

import Link from 'next/link';
import type { RegistrationPass } from '@/data/passes';
import { cn } from '@/lib/utils';

const SHORT_TITLES: Record<string, string> = {
  day_pass: 'DAY',
  group_events: 'GROUP',
  proshow: 'PROSHOW',
  sana_concert: 'ALL ACCESS',
};

type GradientVariant = 'day' | 'group' | 'pro' | 'all';

function getShortTitle(passType: string): string {
  return SHORT_TITLES[passType] ?? passType.toUpperCase().replace(/_/g, ' ');
}

function getPriceLabel(pass: RegistrationPass): string {
  if (pass.priceLabel) return pass.priceLabel;
  if (pass.passType === 'day_pass') return 'PER DAY';
  if (pass.passType === 'group_events') return 'PER MEMBER';
  return 'TOTAL';
}

function getGradientVariant(passType: string): GradientVariant {
  const map: Record<string, GradientVariant> = {
    day_pass: 'day',
    group_events: 'group',
    proshow: 'pro',
    sana_concert: 'all',
  };
  return map[passType] ?? 'day';
}

function barcodeHeights(seed: string): ('100%' | '60%')[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  return Array.from({ length: 40 }, (_, i) => ((Math.abs(h + i) % 2) === 0 ? '100%' : '60%'));
}

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 60 30" className={className} fill="none" aria-hidden="true">
    <ellipse cx="30" cy="15" rx="28" ry="12" stroke="currentColor" strokeWidth="1.5" />
    <ellipse cx="30" cy="15" rx="14" ry="12" stroke="currentColor" strokeWidth="1.5" />
    <line x1="2" y1="15" x2="58" y2="15" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 8 Q30 5 50 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M10 22 Q30 25 50 22" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export interface PassCardTicketProps {
  pass: RegistrationPass;
  onRegister?: (pass: RegistrationPass) => void;
}

export default function PassCardTicket({ pass, onRegister }: PassCardTicketProps) {
  const shortTitle = getShortTitle(pass.passType);
  const priceLabel = getPriceLabel(pass);
  const gradient = getGradientVariant(pass.passType);
  const includesItems = pass.includes ?? pass.meta.slice(0, 4).map((m) => ({ label: 'INFO', value: m }));
  const includesStrings = includesItems.map((item) => `${item.label}: ${item.value}`);
  const bestFor = pass.bestFor ?? pass.details ?? pass.meta[0] ?? '';
  const heights = barcodeHeights(pass.id);

  const ctaClasses = cn(
    'w-full p-4 text-center uppercase font-semibold text-sm tracking-widest',
    'bg-black text-white rounded-lg',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100'
  );
  const cta = onRegister ? (
    <button
      type="button"
      onClick={() => onRegister(pass)}
      className={ctaClasses}
      aria-label={`Register for ${pass.title}`}
    >
      Register
    </button>
  ) : (
    <Link
      href="/register"
      className={cn(ctaClasses, 'block no-underline')}
      aria-label={`Register for ${pass.title}`}
    >
      Register
    </Link>
  );

  return (
    <article
      role="article"
      className={cn(
        'pass-card-ticket',
        'flex flex-col h-full w-full max-w-[380px]',
        'rounded-2xl overflow-hidden',
        'border border-neutral-200/80 bg-white',
        'shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
      )}
      data-pass-type={pass.passType}
    >
      {/* Header: gradient from globals.css, punch holes, globe, title, price pill */}
      <div className="pass-card-ticket__header relative flex flex-col items-center justify-center min-h-[280px] sm:min-h-[300px] px-6 py-6 rounded-t-2xl text-[#1a1a1a] shrink-0">
        <div className="absolute top-3 left-4 size-[10px] rounded-full bg-black" aria-hidden="true"></div>
        <div className="absolute top-3 right-4 size-[10px] rounded-full bg-black" aria-hidden="true"></div>
        <div className="mb-1.5">
          <GlobeIcon className="w-11 h-[22px] text-[#1a1a1a]" />
        </div>
        <p className="text-[10px] font-semibold tracking-[0.2em] mb-4">TAKSHASHILA 2026</p>
        <div className="relative flex justify-center items-center mb-2">
          <span
            className="absolute w-[140%] max-w-[260px] h-[55%] border border-[#1a1a1a]/40 rounded-full -rotate-[12deg]"
            aria-hidden="true"
          />
          <h2 className="pass-card-ticket__short-title relative z-10 text-[#1a1a1a]">
            {shortTitle}
          </h2>
        </div>
        <p className="text-[11px] font-semibold tracking-[0.25em] mb-4">+ {pass.title} +</p>
        <div className="border border-[#1a1a1a] rounded-full px-6 py-2 bg-white/20 mb-2">
          <span className="text-sm font-semibold tracking-wide">{pass.price}</span>
        </div>
        <p className="text-[10px] text-[#1a1a1a]/70">{priceLabel}</p>
        <div className="w-12 h-0.5 bg-[#1a1a1a]/20 rounded-full mt-2 overflow-hidden">
          <div className="h-full w-[70%] bg-[#1a1a1a] rounded-full" />
        </div>
      </div>

      {/* Divider with cutouts – connects header to body */}
      <div className="relative h-[18px] bg-neutral-100 flex items-center border-t border-neutral-200/60">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-neutral-800" aria-hidden="true" />
        <span className="flex-1 mx-3 border-t border-dashed border-neutral-300" />
        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-neutral-800" aria-hidden="true" />
      </div>

      {/* White section: flex-grow; two wrappers so dynamic content expands and static footer aligns across cards */}
      <div className="bg-neutral-50 flex flex-col flex-grow min-h-0 px-5 py-4">
        {/* Wrapper A: Dynamic content – min-height matches Day Pass reference so all cards share same layout */}
        <div className="flex flex-col flex-grow min-h-[220px] gap-4">
          <div>
            <p className="text-[8px] uppercase tracking-wider text-neutral-500 mb-1">Description</p>
            <p className="text-xs font-medium text-neutral-800 leading-snug">{pass.details}</p>
            <div className="flex justify-end gap-1 mt-2 text-right">
              <span className="text-3xl font-bold leading-none text-neutral-800">T</span>
              <span className="text-2xl font-bold leading-none text-neutral-800">26</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-800 mb-2">Includes</p>
            <ul className="flex flex-col gap-1.5">
              {includesStrings.slice(0, 4).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[10px] text-neutral-700">
                  <span className="text-neutral-800">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Wrapper B: Static footer – mt-auto pins to bottom; same layout on every card */}
        <div className="mt-auto shrink-0 pt-4">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-neutral-600 mb-0.5">Best for</p>
            <p className="text-[9px] text-neutral-600 leading-snug max-w-[200px]" title={bestFor}>
              {bestFor}
            </p>
          </div>
          <div className="flex items-end justify-between gap-3 mt-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex flex-col">
                {[0, 1].map((row) => (
                  <div key={row} className="flex">
                    {Array.from({ length: 10 }, (_, col) => (
                      <div
                        key={col}
                        className={cn(
                          'w-1 h-1',
                          (row + col) % 2 === 0 ? 'bg-neutral-800' : 'bg-neutral-200'
                        )}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div
                className="flex gap-px h-5 items-end"
                role="img"
                aria-label="Decorative barcode"
              >
                {heights.map((h, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-neutral-800 flex-shrink-0"
                    style={{ height: h }}
                  />
                ))}
              </div>
            </div>
            <div className="w-11 h-11 rounded-full border-2 border-neutral-800 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <span className="text-sm font-bold text-neutral-800">T26</span>
            </div>
          </div>
          <p className="text-[8px] text-neutral-400 tracking-wider mt-1">UNAUTHORISED RESALE PROHIBITED</p>

          {/* Fixed spacing between barcode/stamp and Register button */}
          <div className="border-t border-black mt-6 pt-4" onClick={(e) => e.stopPropagation()}>
            {cta}
          </div>
        </div>
      </div>
    </article>
  );
}
