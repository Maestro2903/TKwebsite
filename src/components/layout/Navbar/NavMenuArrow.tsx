'use client';

import { MENU_ARROW_PATH } from './constants';

export function NavMenuArrow({ className = 'nav_menu_icon-svg' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      viewBox="0 0 58 58"
      fill="none"
      className={className}
      aria-hidden
    >
      <path fill="#fff" d={MENU_ARROW_PATH} />
    </svg>
  );
}
