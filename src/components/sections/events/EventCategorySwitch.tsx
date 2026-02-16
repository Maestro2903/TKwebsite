'use client';

import { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

export type EventCategory = 'non-technical' | 'technical';

interface EventCategorySwitchProps {
  value: EventCategory;
  onChangeAction: (value: EventCategory) => void;
}

export default function EventCategorySwitch({
  value,
  onChangeAction,
}: EventCategorySwitchProps) {
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onChangeAction('non-technical');
        tabListRef.current?.querySelector<HTMLButtonElement>('#tab-non-technical')?.focus();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onChangeAction('technical');
        tabListRef.current?.querySelector<HTMLButtonElement>('#tab-technical')?.focus();
      }
    },
    [onChangeAction]
  );

  return (
    <div
      className={cn(
        'events-category-switch',
        'flex flex-col items-center',
        'bg-[var(--editorial-black,#000)]',
        'border-y border-[var(--editorial-gray-dark,#333)]',
        'px-4 py-4'
      )}
    >
      <div
        ref={tabListRef}
        className="w-full max-w-lg min-w-0 overflow-x-auto overflow-y-hidden sm:overflow-visible"
        role="tablist"
        aria-label="Event category"
        onKeyDown={handleKeyDown}
      >
        <div className="flex border border-[var(--editorial-gray-dark,#333)] min-w-max sm:min-w-0">
          <button
            type="button"
            role="tab"
            aria-selected={value === 'non-technical'}
            aria-controls="events-grid-non-technical"
            id="tab-non-technical"
            className={cn(
              'relative flex-1 min-w-[130px] py-3.5 px-4',
              'font-editorial text-xs sm:text-sm font-semibold uppercase tracking-wider',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editorial-blue,#0047FF)] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
              value === 'non-technical'
                ? 'bg-[var(--editorial-blue,#0047FF)] text-[var(--editorial-white,#FFF)]'
                : 'bg-transparent text-[var(--editorial-gray-muted,#999)] hover:text-[var(--editorial-white,#FFF)]'
            )}
            data-selected={value === 'non-technical' ? true : undefined}
            onClick={() => onChangeAction('non-technical')}
            tabIndex={value === 'non-technical' ? 0 : -1}
          >
            Non-Technical
          </button>
          <div
            className="w-px bg-[var(--editorial-gray-dark,#333)]"
            aria-hidden
          />
          <button
            type="button"
            role="tab"
            aria-selected={value === 'technical'}
            aria-controls="events-grid-technical"
            id="tab-technical"
            className={cn(
              'relative flex-1 min-w-[130px] py-3.5 px-4',
              'font-editorial text-xs sm:text-sm font-semibold uppercase tracking-wider',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editorial-blue,#0047FF)] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
              value === 'technical'
                ? 'bg-[var(--editorial-blue,#0047FF)] text-[var(--editorial-white,#FFF)]'
                : 'bg-transparent text-[var(--editorial-gray-muted,#999)] hover:text-[var(--editorial-white,#FFF)]'
            )}
            data-selected={value === 'technical' ? true : undefined}
            onClick={() => onChangeAction('technical')}
            tabIndex={value === 'technical' ? 0 : -1}
          >
            Technical
          </button>
        </div>
      </div>
    </div>
  );
}
