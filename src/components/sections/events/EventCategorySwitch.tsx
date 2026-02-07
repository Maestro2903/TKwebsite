'use client';

import { useCallback, useRef } from 'react';
import { X } from 'lucide-react';

export type EventCategory = 'non-technical' | 'technical';

interface EventCategorySwitchProps {
  value: EventCategory;
  onChange: (value: EventCategory) => void;
  /** When true, the sticky bar is hidden (e.g. after scrolling down) */
  isHidden?: boolean;
}

export default function EventCategorySwitch({ value, onChange, isHidden = false }: EventCategorySwitchProps) {
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onChange('non-technical');
        tabListRef.current?.querySelector<HTMLButtonElement>('#tab-non-technical')?.focus();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onChange('technical');
        tabListRef.current?.querySelector<HTMLButtonElement>('#tab-technical')?.focus();
      }
    },
    [onChange]
  );

  return (
    <div
      className={`events-category-switch ${isHidden ? 'events-category-switch--hidden' : ''} sticky z-40 flex flex-col items-center justify-center border-b border-neutral-700 bg-[#151515] px-4 py-3 transition-transform duration-300 ease-out top-[var(--nav-height,85px)]`}
      aria-hidden={isHidden}
    >
      {/* Top strip label - matches SciFiCard strip */}
      <div className="mb-2 flex w-full max-w-md items-center justify-center gap-2 border-b border-neutral-800 pb-2">
        <X size={10} className="text-neutral-600" aria-hidden />
        <span className="font-orbitron text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
          Event category
        </span>
        <X size={10} className="text-neutral-600" aria-hidden />
      </div>

      <div
        ref={tabListRef}
        className="w-full max-w-md"
        role="tablist"
        aria-label="Event category"
        onKeyDown={handleKeyDown}
      >
        <div className="relative flex rounded-none border border-neutral-800 bg-[#1a1a1a] p-0.5">
          <button
            type="button"
            role="tab"
            aria-selected={value === 'non-technical'}
            aria-controls="events-grid-non-technical"
            id="tab-non-technical"
            className="relative z-10 flex-1 py-3 font-orbitron text-xs font-semibold uppercase tracking-wider text-neutral-400 transition-colors hover:text-neutral-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-500 focus-visible:outline-offset-2 min-[480px]:text-sm data-[selected]:text-neutral-200"
            data-selected={value === 'non-technical' ? true : undefined}
            onClick={() => onChange('non-technical')}
            tabIndex={value === 'non-technical' ? 0 : -1}
          >
            Non-Technical
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={value === 'technical'}
            aria-controls="events-grid-technical"
            id="tab-technical"
            className="relative z-10 flex-1 py-3 font-orbitron text-xs font-semibold uppercase tracking-wider text-neutral-400 transition-colors hover:text-neutral-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-500 focus-visible:outline-offset-2 min-[480px]:text-sm data-[selected]:text-neutral-200"
            data-selected={value === 'technical' ? true : undefined}
            onClick={() => onChange('technical')}
            tabIndex={value === 'technical' ? 0 : -1}
          >
            Technical
          </button>
          {/* Sliding indicator */}
          <span
            className="absolute bottom-0.5 top-0.5 w-[calc(50%-4px)] border border-neutral-600 bg-neutral-800/80 transition-[left] duration-300 ease-out"
            aria-hidden
            style={{
              left: value === 'technical' ? 'calc(50% + 2px)' : '2px',
            }}
          />
        </div>
      </div>
    </div>
  );
}
