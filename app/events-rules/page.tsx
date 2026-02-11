'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import StickyRegisterCTA from '@/components/layout/StickyRegisterCTA';
import { EVENT_RULES, type RuleSection } from '@/data/rules';

export default function EventsRulesPage() {
  const [activeId, setActiveId] = useState(EVENT_RULES[0].id);
  const tabListRef = useRef<HTMLDivElement>(null);

  const activeIndex = EVENT_RULES.findIndex((s) => s.id === activeId);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp' && activeIndex > 0) {
        e.preventDefault();
        const prev = EVENT_RULES[activeIndex - 1];
        setActiveId(prev.id);
        tabListRef.current?.querySelector<HTMLButtonElement>(`[data-tab="${prev.id}"]`)?.focus();
      } else if (e.key === 'ArrowDown' && activeIndex < EVENT_RULES.length - 1) {
        e.preventDefault();
        const next = EVENT_RULES[activeIndex + 1];
        setActiveId(next.id);
        tabListRef.current?.querySelector<HTMLButtonElement>(`[data-tab="${next.id}"]`)?.focus();
      }
    },
    [activeIndex]
  );

  return (
    <>
      <Navigation />

      <main id="main" className="page_main page_main--events relative z-10">
        {/* Hero */}
        <section className="u-section py-16 md:py-20 text-center bg-[#0a0a0a] border-b border-neutral-800">
          <h1 className="font-orbitron text-4xl md:text-6xl font-semibold uppercase tracking-tight text-white mb-4">
            Events Rules
          </h1>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-400 opacity-80">
            Rules and guidelines for Takshashila 26 events
          </p>
        </section>

        {/* Sidebar + Content */}
        <div className="flex flex-col lg:flex-row min-h-[60vh]">
          {/* Vertical Sidebar */}
          <aside
            ref={tabListRef}
            role="tablist"
            aria-label="Event rules"
            onKeyDown={handleKeyDown}
            className="rulebook-sidebar w-full lg:w-64 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-neutral-800 bg-[#0f0f0f] lg:sticky lg:top-[var(--nav-height,85px)] lg:self-start lg:max-h-[calc(100vh-var(--nav-height,85px))] lg:overflow-y-auto"
          >
            <nav className="p-4 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-6">
              {EVENT_RULES.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  role="tab"
                  data-tab={section.id}
                  aria-selected={activeId === section.id}
                  aria-controls={`panel-${section.id}`}
                  id={`tab-${section.id}`}
                  tabIndex={activeId === section.id ? 0 : -1}
                  onClick={() => setActiveId(section.id)}
                  className={cn(
                    'rulebook-sidebar-item flex-shrink-0 lg:flex-shrink text-left px-4 py-2.5 font-orbitron text-xs font-semibold uppercase tracking-wider rounded transition-colors hover:text-neutral-300 hover:bg-neutral-800/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-500 focus-visible:outline-offset-2',
                    activeId === section.id
                      ? 'text-neutral-200 bg-neutral-800/80 border-l-2 lg:border-l-4 border-neutral-500'
                      : 'text-neutral-400'
                  )}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 u-container py-8 lg:py-10 lg:px-10">
            {EVENT_RULES.map((section) => (
              <RulePanel
                key={section.id}
                section={section}
                isActive={activeId === section.id}
              />
            ))}
          </div>
        </div>

        <div
          data-wf--spacer--section-space="main"
          className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
        />
      </main>

      <Footer />
      <StickyRegisterCTA />
    </>
  );
}

function RulePanel({ section, isActive }: { section: RuleSection; isActive: boolean }) {
  return (
    <div
      id={`panel-${section.id}`}
      role="tabpanel"
      aria-labelledby={`tab-${section.id}`}
      hidden={!isActive}
      className="rulebook-panel max-w-3xl mx-auto"
    >
      {section.intro && (
        <p className="text-neutral-300 text-base leading-relaxed mb-6 opacity-90">
          {section.intro}
        </p>
      )}

      {section.registration.length > 0 && (
        <div className="mb-6">
          <h3 className="font-orbitron font-semibold text-sm uppercase tracking-wider text-neutral-400 mb-3">
            Registration
          </h3>
          <ul className="list-disc list-inside space-y-2 text-neutral-300 text-sm">
            {section.registration.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="font-orbitron font-semibold text-sm uppercase tracking-wider text-neutral-400 mb-3">
          Rules
        </h3>
        <ul className="list-disc list-inside space-y-2 text-neutral-300 text-sm">
          {section.rules.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
