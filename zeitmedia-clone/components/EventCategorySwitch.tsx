'use client';

import { useCallback, useRef } from 'react';

export type EventCategory = 'non-technical' | 'technical';

interface EventCategorySwitchProps {
  value: EventCategory;
  onChange: (value: EventCategory) => void;
}

export default function EventCategorySwitch({ value, onChange }: EventCategorySwitchProps) {
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
      ref={tabListRef}
      className="events-category-switch"
      role="tablist"
      aria-label="Event category"
      onKeyDown={handleKeyDown}
    >
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
        NON-TECHNICAL EVENTS
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
        TECHNICAL EVENTS
      </button>
    </div>
  );
}
