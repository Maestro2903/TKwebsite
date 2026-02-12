'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BarcodeStripe, SectionLabel } from '@/components/decorative/EditorialMotifs';

interface DayRegisterButtonProps {
  href: string;
  label: string;
  subLabel?: string;
  className?: string;
}

/**
 * Editorial CTA bar used once per proshow day.
 * Behaves like a printed footer strip on desktop.
 */
export function DayRegisterButton({ href, label, subLabel, className }: DayRegisterButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex w-full items-stretch border-t border-[var(--editorial-gray,#333)] transition-colors duration-300',
        // Mobile / tablet: solid editorial bar
        'bg-[var(--editorial-blue,#0047FF)] text-black no-underline',
        // Desktop: transparent strip that inverts on hover
        'xl:bg-transparent xl:text-[var(--editorial-white,#FFF)] xl:hover:bg-white xl:hover:text-black',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editorial-blue,#0047FF)] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        className
      )}
    >
      <div className="flex flex-1 items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 xl:px-8">
        {/* Left: label block */}
        <div className="flex flex-col gap-1">
          <SectionLabel className="text-black/70 tracking-[0.2em] xl:text-white/50">
            REGISTER
          </SectionLabel>
          <span className="font-editorial text-[13px] sm:text-[14px] font-semibold uppercase tracking-[0.22em] leading-[1.3]">
            {label}
          </span>
          {subLabel && (
            <span className="mt-1 text-[11px] uppercase tracking-[0.16em] text-black/70 xl:text-white/60">
              {subLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <BarcodeStripe
            variant="vertical"
            color="black"
            className="hidden h-10 w-12 sm:flex opacity-70 xl:opacity-60"
          />
          <span className="font-editorial text-[11px] font-semibold uppercase tracking-[0.28em]">
            REGISTER &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

