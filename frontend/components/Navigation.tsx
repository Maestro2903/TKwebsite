'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
    const { user, signOut, loading } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollingDirection, setScrollingDirection] = useState<'up' | 'down'>('up');
    const [lastScrollY, setLastScrollY] = useState(0);
    const lastScrollYRef = useRef(0);
    const [isAtTop, setIsAtTop] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            setIsAtTop(currentScrollY < 50);
            setIsScrolled(currentScrollY > 50);
            setScrollingDirection(currentScrollY > lastScrollYRef.current ? 'down' : 'up');
            lastScrollYRef.current = currentScrollY;
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    const toggleMenu = useCallback(() => {
        setMenuOpen(prev => !prev);
    }, []);

    const closeMenu = useCallback(() => {
        setMenuOpen(false);
    }, []);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/events', label: 'Events' },
        { href: '/proshows', label: 'Proshows' },
        { href: '/sana-arena', label: 'SaNa Arena' },
    ];

    const socialLinks = [
        {
            href: 'https://www.facebook.com',
            label: 'Facebook',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 32 32" fill="none" className="u-icon-large u-zindex-2">
                    <path fill="#fff" d="M29.667 16.333C29.667 8.973 23.693 3 16.333 3 8.973 3 3 8.973 3 16.333 3 22.787 7.587 28.16 13.667 29.4v-9.067H11v-4h2.667V13a4.672 4.672 0 0 1 4.666-4.667h3.334v4H19c-.733 0-1.333.6-1.333 1.334v2.666h4v4h-4V29.6c6.733-.667 12-6.347 12-13.267Z" />
                </svg>
            ),
        },
        {
            href: 'https://www.instagram.com',
            label: 'Instagram',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 32 32" fill="none" className="u-icon-large u-zindex-2">
                    <path fill="#fff" d="M16.005 12.693a3.306 3.306 0 1 0 0 6.612 3.306 3.306 0 0 0 0-6.612Zm13.24-3.267a8.668 8.668 0 0 0-.56-3.013 5.333 5.333 0 0 0-3.093-3.094 8.667 8.667 0 0 0-3.014-.56c-1.72-.093-2.226-.093-6.573-.093-4.346 0-4.853 0-6.573.093a8.667 8.667 0 0 0-3.013.56 5.333 5.333 0 0 0-3.094 3.094 8.666 8.666 0 0 0-.56 3.013c-.093 1.72-.093 2.227-.093 6.573 0 4.347 0 4.854.093 6.574a9.2 9.2 0 0 0 .56 3.026 5.2 5.2 0 0 0 1.214 1.867 5.2 5.2 0 0 0 1.88 1.213 8.663 8.663 0 0 0 3.013.56c1.72.094 2.226.094 6.573.094s4.854 0 6.573-.094a8.663 8.663 0 0 0 3.014-.56 5.2 5.2 0 0 0 1.88-1.213 5.2 5.2 0 0 0 1.213-1.867 8.8 8.8 0 0 0 .56-3.026c.093-1.72.093-2.227.093-6.574 0-4.346 0-4.853-.093-6.573Zm-3.387 10.667a7.597 7.597 0 0 1-.52 2.4 5.146 5.146 0 0 1-2.84 2.84 7.597 7.597 0 0 1-2.413.466h-8.16a7.598 7.598 0 0 1-2.413-.466 4.667 4.667 0 0 1-1.747-1.147 4.666 4.666 0 0 1-1.093-1.693 7.334 7.334 0 0 1-.453-2.414v-8.16c.014-.824.167-1.64.453-2.413a4.667 4.667 0 0 1 1.147-1.747 4.8 4.8 0 0 1 1.693-1.093 7.6 7.6 0 0 1 2.413-.467h8.16a7.6 7.6 0 0 1 2.413.467 4.667 4.667 0 0 1 1.747 1.147 4.665 4.665 0 0 1 1.093 1.693 7.6 7.6 0 0 1 .467 2.413V16c0 2.747.093 3.027.053 4.08v.014Zm-2.133-9.92a3.172 3.172 0 0 0-1.88-1.88 5.333 5.333 0 0 0-1.84-.294h-8a5.333 5.333 0 0 0-1.84.347 3.173 3.173 0 0 0-1.88 1.813 5.734 5.734 0 0 0-.28 1.84v8c.014.629.131 1.25.347 1.84a3.173 3.173 0 0 0 1.88 1.88 5.732 5.732 0 0 0 1.773.347h8a5.331 5.331 0 0 0 1.84-.347 3.172 3.172 0 0 0 1.88-1.88c.223-.588.34-1.21.347-1.84v-8c0-.63-.118-1.253-.347-1.84v.014Zm-7.72 10.92a5.08 5.08 0 0 1-5.08-5.094 5.093 5.093 0 1 1 5.08 5.094Zm5.334-9.187a1.2 1.2 0 0 1 0-2.387 1.2 1.2 0 0 1 0 2.387Z" />
                </svg>
            ),
        },
        {
            href: 'https://www.tiktok.com',
            label: 'Tiktok',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 32 32" fill="none" className="u-icon-large u-zindex-2">
                    <path fill="#fff" d="M22.134 7.76A5.707 5.707 0 0 1 20.72 4H16.6v16.533a3.453 3.453 0 0 1-3.453 3.334A3.477 3.477 0 0 1 9.68 20.4c0-2.293 2.213-4.013 4.494-3.307V12.88c-4.6-.613-8.627 2.96-8.627 7.52 0 4.44 3.68 7.6 7.587 7.6 4.186 0 7.586-3.4 7.586-7.6v-8.387a9.8 9.8 0 0 0 5.733 1.84v-4.12s-2.506.12-4.32-1.973Z" />
                </svg>
            ),
        },
        {
            href: 'https://www.youtube.com',
            label: 'YouTube',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 32 32" fill="none" className="u-icon-large u-zindex-2">
                    <path fill="#fff" d="M28.8 9.6c-.3-1.2-1.2-2.1-2.4-2.4C24.2 6.5 16 6.5 16 6.5s-8.2 0-10.4.7c-1.2.3-2.1 1.2-2.4 2.4C2.5 11.8 2.5 16 2.5 16s0 4.2.7 6.4c.3 1.2 1.2 2.1 2.4 2.4 2.2.7 10.4.7 10.4.7s8.2 0 10.4-.7c1.2-.3 2.1-1.2 2.4-2.4.7-2.2.7-6.4.7-6.4s0-4.2-.7-6.4ZM13.5 20.5v-9l7 4.5-7 4.5Z" />
                </svg>
            ),
        },
    ];

    const scrollingStarted = !isAtTop;
    const scrollingTop = isAtTop;

    return (
        <>
            {/* Main Navigation Bar */}
            <div
                className={`nav_wrap${pathname?.startsWith('/sana-arena')
                    ? ' nav_wrap--sana-arena'
                    : pathname !== '/' && pathname !== '/proshows'
                        ? ' nav_wrap--solid'
                        : ''
                    }`}
                data-scrolling-started={scrollingStarted ? 'true' : 'false'}
                data-scrolling-top={scrollingTop ? 'true' : 'false'}
                data-scrolling-direction={scrollingDirection}
                data-menu-open={menuOpen ? 'true' : 'false'}
            >
                <div className="nav_contain u-container u-grid-custom">
                    {/* Logo */}
                    <div className="nav_mobile_logo_wrap u-column-2">
                        <Link href="/" aria-label="Home Page" className="nav_mobile_logo" onClick={closeMenu}>
                            <div className="u-max-width-full">
                                <img
                                    src="/assets/images/tk-logo.webp"
                                    alt="TK Logo"
                                    className="u-svg"
                                    style={{ width: 'auto', height: '60px', display: 'block' }}
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="nav_desktop_right_wrap u-column-8">
                        <div className="nav_desktop_right">
                            <ul data-nav-desktop-links="" className="nav_desktop_links_wrap">
                                {navLinks.map((link, index) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className={`nav_desktop_link ${pathname === link.href ? 'w--current' : ''}`}
                                        >
                                            <div className="nav_desktop_link_subtext">{String(index + 1).padStart(2, '0')}</div>
                                            <div className="nav_desktop_link_text">{link.label}</div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <div className="nav_desktop_right_btns">
                                {/* Desktop: Auth: My Pass + Sign out when logged in */}
                                <div className="nav-auth-status-desktop">
                                    {!loading && user && (
                                        <div className="nav-auth-status">
                                            <div className="flex items-center gap-2">
                                                <Link href="/register/my-pass" className="nav-auth-link nav-auth-link--pass">
                                                    My Pass
                                                </Link>
                                                <button type="button" onClick={signOut} className="nav-auth-btn subtle">
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Register Button - visible on all screen sizes, redirects to /login */}
                                <div className="btn-group">
                                    <Link href="/login" className="btn-bubble-arrow">
                                        <div className="btn-bubble-arrow__arrow">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" className="btn-bubble-arrow__arrow-svg">
                                                <polyline points="18 8 18 18 8 18" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="1.5" />
                                                <line x1="18" y1="18" x2="5" y2="5" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="1.5" />
                                            </svg>
                                        </div>
                                        <div className="btn-bubble-arrow__content">
                                            <span className="btn-bubble-arrow__content-text">REGISTER</span>
                                        </div>
                                        <div className="btn-bubble-arrow__arrow is--duplicate">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" className="btn-bubble-arrow__arrow-svg">
                                                <polyline points="18 8 18 18 8 18" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="1.5" />
                                                <line x1="18" y1="18" x2="5" y2="5" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="1.5" />
                                            </svg>
                                        </div>
                                    </Link>
                                </div>

                                <div className="nav_menu_toggle_contain">
                                    <div className="nav_menu_btn_spacer" />
                                    <div data-menu-toggle-wrap="" className="nav_menu_toggle_wrap">
                                        <button
                                            data-menu-toggle=""
                                            className={`nav_menu_toggle ${menuOpen ? 'is-open' : ''}`}
                                            onClick={toggleMenu}
                                            aria-expanded={menuOpen}
                                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                                        >
                                            <div className="nav_menu_line_wrap">
                                                <div data-menu-line-1="" className="nav_menu_line" />
                                                <div data-menu-line-2="" className="nav_menu_line is-2" />
                                            </div>
                                            <div className="nav_screen-reader-text">Menu Button</div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fullscreen Menu Overlay */}
            <nav
                data-menu-wrap=""
                className={`nav_menu_wrap ${menuOpen ? 'is-open' : ''}`}
                aria-hidden={!menuOpen}
            >
                <div className="nav_menu_contain u-container">
                    <div className="nav_menu_grid u-grid-custom">
                        {/* Left Column - Language & Featured */}
                        <div className="nav_menu_column u-column-4">
                            {/* Language Switcher */}
                            <div className="locales_list">
                                <a href="#" className="language_link w--current">EN</a>
                                <a href="#" className="language_link">VI</a>
                            </div>

                            {/* Featured Project */}
                            <div className="u-hide-mobile-landscape">
                                <Link href="/events" className="featured_link" onClick={closeMenu}>
                                    <img
                                        loading="lazy"
                                        src="/images/featured-project.jpg"
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

                        {/* Right Column - Navigation Links */}
                        <div data-lenis-prevent="" className="nav_menu_column u-column-5">
                            <ul>
                                {navLinks.map((link) => (
                                    <li key={link.href} className="nav_menu_link_wrap">
                                        <Link
                                            data-menu-item=""
                                            href={link.href}
                                            className={`nav_menu_link ${pathname === link.href ? 'w--current' : ''}`}
                                            onClick={closeMenu}
                                        >
                                            <div className="nav_menu_icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 58 58" fill="none" className="nav_menu_icon-svg">
                                                    <path fill="#fff" d="m36.756 49-4.694-4.714 11.899-11.95H0v-6.667h43.962l-11.9-11.955L36.755 9l19.912 20.001L36.756 49Z" />
                                                </svg>
                                            </div>
                                            <div className="nav_menu_text">{link.label}</div>
                                        </Link>
                                    </li>
                                ))}
                                {/* My Pass link - redirects to /login if not authenticated */}
                                <li className="nav_menu_link_wrap">
                                    <Link
                                        data-menu-item=""
                                        href={user ? "/register/my-pass" : "/login"}
                                        className={`nav_menu_link ${pathname === '/register/my-pass' ? 'w--current' : ''}`}
                                        onClick={closeMenu}
                                    >
                                        <div className="nav_menu_icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 58 58" fill="none" className="nav_menu_icon-svg">
                                                <path fill="#fff" d="m36.756 49-4.694-4.714 11.899-11.95H0v-6.667h43.962l-11.9-11.955L36.755 9l19.912 20.001L36.756 49Z" />
                                            </svg>
                                        </div>
                                        <div className="nav_menu_text">My Pass</div>
                                    </Link>
                                </li>
                                <li className="nav_menu_link_wrap">
                                    <Link
                                        data-menu-item=""
                                        href="/login"
                                        className={`nav_menu_link ${pathname === '/login' || pathname === '/register' ? 'w--current' : ''}`}
                                        onClick={closeMenu}
                                    >
                                        <div className="nav_menu_icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 58 58" fill="none" className="nav_menu_icon-svg">
                                                <path fill="#fff" d="m36.756 49-4.694-4.714 11.899-11.95H0v-6.667h43.962l-11.9-11.955L36.755 9l19.912 20.001L36.756 49Z" />
                                            </svg>
                                        </div>
                                        <div className="nav_menu_text">Register</div>
                                    </Link>
                                </li>
                                {/* Sign out in mobile menu when logged in */}
                                {user && (
                                    <li className="nav_menu_link_wrap">
                                        <button
                                            type="button"
                                            data-menu-item=""
                                            className="nav_menu_link"
                                            onClick={() => {
                                                closeMenu();
                                                signOut();
                                            }}
                                            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit', padding: 0 }}
                                        >
                                            <div className="nav_menu_icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 58 58" fill="none" className="nav_menu_icon-svg">
                                                    <path fill="#fff" d="m36.756 49-4.694-4.714 11.899-11.95H0v-6.667h43.962l-11.9-11.955L36.755 9l19.912 20.001L36.756 49Z" />
                                                </svg>
                                            </div>
                                            <div className="nav_menu_text">Sign out</div>
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
