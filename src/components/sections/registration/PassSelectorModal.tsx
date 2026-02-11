'use client';

import { useEffect, useRef } from 'react';
import { REGISTRATION_PASSES } from '@/data/passes';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

interface PassSelectorModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function PassSelectorModal({ isOpen, onCloseAction }: PassSelectorModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previousActiveElement.current = document.activeElement as HTMLElement | null;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseAction();
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      previousActiveElement.current?.focus();
    };
  }, [isOpen, onCloseAction]);

  // Lock global body scroll (and Lenis) when modal is open
  useLockBodyScroll(isOpen);

  function handleSelect(passId: string) {
    const el = document.getElementById(passId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onCloseAction();
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="pass-selector-modal modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pass-selector-title"
      onClick={(e) => e.target === overlayRef.current && onCloseAction()}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div
        className="pass-selector-modal__panel modal-content-scroll"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="pass-selector-modal__header">
          <h2 id="pass-selector-title" className="pass-selector-modal__title">
            Choose your pass
          </h2>
          <button
            type="button"
            className="pass-selector-modal__close"
            aria-label="Close"
            onClick={onCloseAction}
          >
            ×
          </button>
        </div>
        <ul className="pass-selector-modal__list">
          {REGISTRATION_PASSES.map((pass) => (
            <li key={pass.id}>
              <button
                type="button"
                className="pass-selector-modal__option"
                onClick={() => handleSelect(pass.id)}
              >
                <span className="pass-selector-modal__option-title">
                  {pass.emoji} {pass.title}
                </span>
                <span className="pass-selector-modal__option-price">{pass.price}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
