'use client';

interface NavbarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  'aria-controls'?: string;
}

export function NavbarToggle({ isOpen, onToggle, 'aria-controls': ariaControls }: NavbarToggleProps) {
  return (
    <div className="nav_menu_toggle_contain">
      <div className="nav_menu_btn_spacer" />
      <div data-menu-toggle-wrap="" className="nav_menu_toggle_wrap">
        <button
          data-menu-toggle=""
          type="button"
          className={`nav_menu_toggle ${isOpen ? 'is-open' : ''}`}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={ariaControls}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <div className="nav_menu_line_wrap">
            <div data-menu-line-1="" className="nav_menu_line" aria-hidden />
            <div data-menu-line-2="" className="nav_menu_line is-2" aria-hidden />
          </div>
          <span className="nav_screen-reader-text">Menu</span>
        </button>
      </div>
    </div>
  );
}
