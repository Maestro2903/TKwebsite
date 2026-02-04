'use client';

const REGISTER_URL = '/register';

export default function StickyRegisterCTA() {
  return (
    <div className="events-sticky-cta">
      <div
        data-wf--button-main--style="primary"
        className="button_main_wrap events-sticky-cta__btn"
      >
        <div className="clickable_wrap u-cover-absolute">
          <a href={REGISTER_URL} className="clickable_link w-inline-block">
            <span className="clickable_text u-sr-only">[ Register Now ]</span>
          </a>
        </div>
        <div aria-hidden className="button_main_text u-text-style-main">
          Register Now
        </div>
        <div className="button_bg" />
      </div>
    </div>
  );
}
