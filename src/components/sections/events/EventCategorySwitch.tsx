'use client';

import { useCallback, useRef } from 'react';

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
      className={`events-category-switch ${isHidden ? 'events-category-switch--hidden' : ''}`}
      aria-hidden={isHidden}
    >
      <div
        ref={tabListRef}
        className="events-category-switch__inner"
        role="tablist"
        aria-label="Event category"
        onKeyDown={handleKeyDown}
      >
        <div className="events-category-switch__track">
          <button
            type="button"
            role="tab"
            aria-selected={value === 'non-technical'}
            aria-controls="events-grid-non-technical"
            id="tab-non-technical"
            className="events-category-switch__tab"
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
            className="events-category-switch__tab"
            onClick={() => onChange('technical')}
            tabIndex={value === 'technical' ? 0 : -1}
          >
            Technical
          </button>
          <span
            className="events-category-switch__slider"
            aria-hidden
            style={{ ['--selected-index' as string]: value === 'technical' ? 1 : 0 }}
          />
        </div>
      </div>
    </div>
  );
}
