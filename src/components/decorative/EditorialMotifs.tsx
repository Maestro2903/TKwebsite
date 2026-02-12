'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/** Thin repeating lines - barcode-like stripe for editorial aesthetic */
export function BarcodeStripe({
  className,
  variant = 'horizontal',
  color = 'black',
}: {
  className?: string;
  variant?: 'horizontal' | 'vertical';
  color?: 'black' | 'white';
}) {
  const lines = Array.from({ length: 32 }, (_, i) => (
    <div
      key={i}
      className={cn(
        'bg-current shrink-0',
        variant === 'horizontal' ? 'w-px h-2 sm:h-2.5' : 'h-px w-full'
      )}
      style={{ opacity: i % 4 === 0 ? 1 : 0.5 }}
    />
  ));

  return (
    <div
      className={cn(
        'flex',
        variant === 'horizontal'
          ? 'flex-row items-center justify-start gap-px w-full overflow-hidden'
          : 'flex-col items-stretch gap-px',
        color === 'white' ? 'text-white' : 'text-black',
        className
      )}
      aria-hidden
    >
      {lines}
    </div>
  );
}

/** Small uppercase labels for metadata / section headers */
export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'font-editorial text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em]',
        'text-[var(--editorial-gray,#CCCCCC)]',
        className
      )}
    >
      {children}
    </span>
  );
}

/** Thin line divider with optional label */
export function EditorialDivider({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 w-full',
        className
      )}
      aria-hidden
    >
      {label ? (
        <>
          <span
            className={cn(
              'font-editorial text-[10px] font-semibold uppercase tracking-[0.15em]',
              'text-[var(--editorial-gray,#999)] shrink-0'
            )}
          >
            {label}
          </span>
          <div className="flex-1 h-px bg-[var(--editorial-gray,#333)]" />
        </>
      ) : (
        <div className="w-full h-px bg-[var(--editorial-gray,#333)]" />
      )}
    </div>
  );
}

/** Structured key-value display for metadata */
export function MetadataRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2',
        className
      )}
    >
      <span
        className={cn(
          'font-editorial text-[10px] font-semibold uppercase tracking-[0.15em]',
          'text-[var(--editorial-gray,#999)] shrink-0'
        )}
      >
        {label}
      </span>
      <span className="text-[13px] text-[var(--editorial-white,#FFF)]">
        {value}
      </span>
    </div>
  );
}
