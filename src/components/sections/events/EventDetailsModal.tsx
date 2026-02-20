'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { EventItem } from '@/data/events';
import { cn } from '@/lib/utils';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { BarcodeStripe, SectionLabel } from '@/components/decorative/EditorialMotifs';

interface EventDetailsModalProps {
  event: EventItem;
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function EventDetailsModal({
  event,
  isOpen,
  onCloseAction,
}: EventDetailsModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const focusableSelector =
    'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

  const trapFocus = React.useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const root = contentRef.current;
    if (!root) return;
    const focusables = Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
      (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
      return;
    }

    if (e.shiftKey && (active === first || active === root)) {
      e.preventDefault();
      last.focus();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      return () => cancelAnimationFrame(t);
    }
  }, [isOpen]);

  useLockBodyScroll(isOpen);

  const handleClose = React.useCallback(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      onCloseAction();
      previousActiveElementRef.current?.focus?.();
    }, 200);
    return () => clearTimeout(timer);
  }, [onCloseAction]);

  useEffect(() => {
    if (!isOpen) return;

    const t = window.setTimeout(() => {
      closeBtnRef.current?.focus?.();
    }, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }
      trapFocus(e);
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [isOpen, handleClose, trapFocus]);

  if (!isOpen) return null;

  const description = event.fullDescription ?? event.description;
  const registerHref = '/register';

  const modalContent = (
    <div
      className={cn(
        'modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6',
        'bg-black/95',
        'transition-opacity duration-200',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-details-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div
        ref={contentRef}
        className={cn(
          'event-details-modal w-full max-w-lg sm:max-w-xl',
          'max-h-[90vh] overflow-y-auto',
          'bg-[var(--editorial-black,#000)]',
          'border border-[var(--editorial-gray-dark,#333)]',
          'transition-all duration-300 ease-out',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]',
          'rounded-none flex flex-col'
        )}
        tabIndex={-1}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - electric blue title block */}
        <div className="flex-shrink-0 bg-[var(--editorial-blue,#0047FF)] px-4 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <SectionLabel className="text-white/70 mb-1 block text-[10px]">
                EVENT /// INFO
              </SectionLabel>
              <h2
                id="event-details-title"
                className="font-editorial font-bold text-lg sm:text-xl text-white uppercase tracking-tight leading-tight"
              >
                {event.name}
              </h2>
              <BarcodeStripe variant="horizontal" color="white" className="mt-2 opacity-60 max-w-[80px]" />
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              className={cn(
                'shrink-0 p-2 -m-2 min-w-[44px] min-h-[44px]',
                'text-white/80 hover:text-white transition-colors',
                'flex items-center justify-center',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600'
              )}
              aria-label="Close"
              onClick={handleClose}
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Image */}
          <div className="relative w-full aspect-[4/3] border-b border-[var(--editorial-gray-dark,#333)]">
            <Image
              src={event.image}
              alt={event.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 36rem"
              priority={false}
            />
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            <SectionLabel className="text-[var(--editorial-gray-muted,#999)] mb-3 block">
              ABOUT
            </SectionLabel>
            {description ? (
              <p className="text-[var(--editorial-gray,#E5E5E5)] text-sm leading-relaxed whitespace-pre-line">
                {description}
              </p>
            ) : (
              <p className="text-[var(--editorial-gray-muted,#666)] text-sm italic">
                No description available.
              </p>
            )}

            {/* CTAs */}
            <div className="mt-6 pt-4 border-t border-[var(--editorial-gray-dark,#333)] flex flex-col sm:flex-row gap-2">
              {event.externalUrl ? (
                <a
                  href={event.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex-1 py-3 px-4 text-center',
                    'font-editorial text-xs font-semibold uppercase tracking-wider',
                    'bg-[var(--editorial-blue,#0047FF)]/50 text-white',
                    'transition-colors duration-200 hover:bg-[var(--editorial-blue,#0047FF)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editorial-blue,#0047FF)] focus-visible:ring-offset-2 focus-visible:ring-offset-black'
                  )}
                >
                  REGISTER
                </a>
              ) : (
                <Link
                  href={registerHref}
                  className={cn(
                    'flex-1 py-3 px-4 text-center',
                    'font-editorial text-xs font-semibold uppercase tracking-wider',
                    'bg-[var(--editorial-blue,#0047FF)]/50 text-white',
                    'transition-colors duration-200 hover:bg-[var(--editorial-blue,#0047FF)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editorial-blue,#0047FF)] focus-visible:ring-offset-2 focus-visible:ring-offset-black'
                  )}
                >
                  REGISTER
                </Link>
              )}
              <button
                type="button"
                onClick={handleClose}
                className={cn(
                  'py-3 px-4',
                  'font-editorial text-xs font-semibold uppercase tracking-wider',
                  'border border-[var(--editorial-white,#FFF)] text-[var(--editorial-white,#FFF)]',
                  'transition-colors hover:border-[var(--editorial-blue,#0047FF)] hover:text-[var(--editorial-blue,#0047FF)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editorial-blue,#0047FF)] focus-visible:ring-offset-2 focus-visible:ring-offset-black'
                )}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
