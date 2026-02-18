'use client';

import { useState, useRef, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useNavbarScroll } from './useNavbarScroll';
import { NavbarLinksDesktop } from './NavbarLinks';
import { NavbarToggle } from './NavbarToggle';
import { NavMenuOverlay, MENU_OVERLAY_ID } from './NavMenuOverlay';

function NavbarInner() {
  const { user, signOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const firstMenuItemRef = useRef<HTMLAnchorElement | null>(null);
  const pathname = usePathname();

  useLockBodyScroll(menuOpen);
  useNavbarScroll(navRef);

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const navClassName = [
    'nav_wrap',
    pathname?.startsWith('/sana-arena') && 'nav_wrap--sana-arena',
    pathname?.startsWith('/events') && 'nav_wrap--events',
    pathname !== '/' && pathname !== '/proshows' && !pathname?.startsWith('/events') && 'nav_wrap--solid',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <nav
        ref={navRef}
        className={navClassName}
        aria-label="Main navigation"
        data-menu-open={menuOpen ? 'true' : 'false'}
      >
        <div className="nav_contain u-container u-grid-custom">
          <div className="nav_mobile_logo_wrap u-column-2">
            <Link
              href="/"
              aria-label="Home Page"
              className="nav_mobile_logo"
              onClick={closeMenu}
            >
              <div className="u-max-width-full">
                <img
                  src="/assets/images/tk-logo.webp"
                  alt="TK Logo"
                  className="u-svg"
                />
              </div>
            </Link>
          </div>

          <div className="nav_desktop_right_wrap u-column-8">
            <div className="nav_desktop_right">
              <NavbarLinksDesktop pathname={pathname ?? ''} />

              <div className="nav_desktop_right_btns">
                {!loading && user && (
                  <div className="nav-auth-status">
                    <div className="flex items-center gap-2">
                      <Link
                        href="/register/my-pass"
                        className="nav-auth-link nav-auth-link--pass"
                      >
                        My Pass
                      </Link>
                      <button
                        type="button"
                        onClick={signOut}
                        className="nav-auth-btn subtle"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}

                <div className="btn-group">
                  <Link href="/login" className="btn-bubble-arrow">
                    <div className="btn-bubble-arrow__content">
                      <span className="btn-bubble-arrow__content-text">
                        Register
                      </span>
                    </div>
                  </Link>
                </div>

                <NavbarToggle
                  isOpen={menuOpen}
                  onToggle={toggleMenu}
                  aria-controls={MENU_OVERLAY_ID}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <NavMenuOverlay
        isOpen={menuOpen}
        onClose={closeMenu}
        pathname={pathname ?? ''}
        user={user}
        onSignOut={signOut}
        firstMenuItemRef={firstMenuItemRef}
      />
    </>
  );
}

export const Navbar = memo(NavbarInner);
