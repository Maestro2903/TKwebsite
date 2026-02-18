'use client';

import Link from 'next/link';
import { NAV_LINKS } from './constants';

export function NavbarLinksDesktop({ pathname }: { pathname: string }) {
  return (
    <ul data-nav-desktop-links="" className="nav_desktop_links_wrap">
      {NAV_LINKS.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={`nav_desktop_link ${pathname === link.href ? 'w--current' : ''}`}
          >
            <div className="nav_desktop_link_text">{link.label}</div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
