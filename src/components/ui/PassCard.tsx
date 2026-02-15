'use client';

import Link from 'next/link';
import type { RegistrationPass } from '@/data/passes';
import { cn } from '@/lib/utils';

interface PassCardProps {
  pass: RegistrationPass;
  onRegister?: (pass: RegistrationPass) => void;
}

const ctaStyles = cn(
  'w-full py-3 text-center uppercase font-semibold text-sm tracking-wider',
  'border border-white',
  'transition-all duration-300',
  'hover:bg-white hover:text-black',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black'
);

export default function PassCard({ pass, onRegister }: PassCardProps) {
  return (
    <article
      className={cn(
        'pass-card',
        'group relative flex flex-col h-full',
        'bg-black',
        'border border-[rgba(255,255,255,0.15)]',
        'transition-all duration-300',
        'hover:border-white/40',
        'hover:-translate-y-1'
      )}
    >
      <div className="flex flex-col flex-1 min-h-0 p-4">
        {/* Pass Title */}
        <h2 className="font-bold uppercase tracking-[0.02em] text-lg sm:text-xl text-white leading-tight">
          {pass.title}
        </h2>

        {/* Short Description */}
        {pass.details && (
          <p className="text-[13px] leading-relaxed text-white/60 line-clamp-3 mt-2">
            {pass.details}
          </p>
        )}

        {/* Meta / Highlights (optional) */}
        {pass.meta && pass.meta.length > 0 && (
          <div className="mt-2 text-[11px] uppercase tracking-wider text-white/50 space-y-0.5">
            {pass.meta.map((item, idx) => (
              <div key={idx}>{item}</div>
            ))}
          </div>
        )}

        {/* Price */}
        <p className="text-2xl font-bold text-white mt-4">
          {pass.price}
        </p>

        {/* CTA - single REGISTER, bottom push */}
        <div className="mt-auto pt-4" onClick={(e) => e.stopPropagation()}>
          {onRegister ? (
            <button
              type="button"
              onClick={() => onRegister(pass)}
              className={ctaStyles}
              aria-label={`Register for ${pass.title}`}
            >
              REGISTER
            </button>
          ) : (
            <Link
              href="/register"
              className={cn(ctaStyles, 'block no-underline')}
              aria-label={`Register for ${pass.title}`}
            >
              REGISTER
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
