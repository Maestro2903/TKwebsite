'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { NAV_LINKS } from './constants';
import { NavMenuArrow } from './NavMenuArrow';

const MENU_OVERLAY_ID = 'nav-menu-overlay';

interface NavMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  user: { uid: string } | null;
  onSignOut: () => void;
  firstMenuItemRef: React.RefObject<HTMLAnchorElement | null>;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

export function NavMenuOverlay({
  isOpen,
  onClose,
  pathname,
  user,
  onSignOut,
  firstMenuItemRef,
}: NavMenuOverlayProps) {
  const overlayRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const overlay = overlayRef.current;
    const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
    toggleRef.current = toggle;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        toggle?.focus();
        return;
      }
      if (e.key !== 'Tab' || !overlay) return;
      const focusables = getFocusableElements(overlay);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && firstMenuItemRef.current) {
      firstMenuItemRef.current.focus();
    }
  }, [isOpen, firstMenuItemRef]);

  const handleSignOut = useCallback(() => {
    onClose();
    onSignOut();
  }, [onClose, onSignOut]);

  return (
    <nav
      ref={overlayRef}
      id={MENU_OVERLAY_ID}
      data-menu-wrap=""
      className={`nav_menu_wrap ${isOpen ? 'is-open' : ''}`}
      aria-hidden={!isOpen}
      aria-label="Main navigation"
    >
      <div className="nav_menu_contain u-container">
        <div className="nav_menu_grid u-grid-custom">
          <div className="nav_menu_column u-column-4">
            <div className="locales_list" aria-label="Language selection">
              <button type="button" className="language_link w--current">
                EN
              </button>
              <button type="button" className="language_link">
                VI
              </button>
            </div>
            <div className="u-hide-mobile-landscape">
              <Link href="/events" className="featured_link" onClick={onClose}>
                <img
                  loading="lazy"
                  src="/assets/images/hero-poster.webp"
                  alt="Featured Project"
                  className="featured_image"
                />
                <div className="featured_info_wrap">
                  <div className="featured_info_text">Featured Event</div>
                  <div className="featured_cs_title">TK FEST 2025</div>
                </div>
              </Link>
            </div>
          </div>

          <div data-lenis-prevent="" className="nav_menu_column u-column-5">
            <ul>
              {NAV_LINKS.map((link, index) => (
                <li key={link.href} className="nav_menu_link_wrap">
                  <Link
                    data-menu-item=""
                    href={link.href}
                    className={`nav_menu_link ${pathname === link.href ? 'w--current' : ''}`}
                    onClick={onClose}
                    ref={index === 0 ? firstMenuItemRef : undefined}
                  >
                    <div className="nav_menu_icon">
                      <NavMenuArrow />
                    </div>
                    <div className="nav_menu_text">{link.label}</div>
                  </Link>
                </li>
              ))}
              <li className="nav_menu_link_wrap">
                <Link
                  data-menu-item=""
                  href={user ? '/register/my-pass' : '/login'}
                  className={`nav_menu_link ${pathname === '/register/my-pass' ? 'w--current' : ''}`}
                  onClick={onClose}
                >
                  <div className="nav_menu_icon">
                    <NavMenuArrow />
                  </div>
                  <div className="nav_menu_text">My Pass</div>
                </Link>
              </li>
              <li className="nav_menu_link_wrap">
                <Link
                  data-menu-item=""
                  href="/login"
                  className={`nav_menu_link ${
                    pathname === '/login' || pathname === '/register' ? 'w--current' : ''
                  }`}
                  onClick={onClose}
                >
                  <div className="nav_menu_icon">
                    <NavMenuArrow />
                  </div>
                  <div className="nav_menu_text">Register</div>
                </Link>
              </li>
              {user && (
                <li className="nav_menu_link_wrap">
                  <button
                    type="button"
                    data-menu-item=""
                    className="nav_menu_link"
                    onClick={handleSignOut}
                  >
                    <div className="nav_menu_icon">
                      <NavMenuArrow />
                    </div>
                    <div className="nav_menu_text">Sign Out</div>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export { MENU_OVERLAY_ID };
