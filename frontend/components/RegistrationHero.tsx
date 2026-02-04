'use client';

import RegistrationUrgency from './RegistrationUrgency';

export default function RegistrationHero() {
  return (
    <section className="registration-hero u-section" aria-labelledby="registration-hero-title">
      <div className="eyebrow_wrap u-margin-bottom-4">
        <div className="eyebrow_layout">
          <div className="eyebrow_marker" aria-hidden />
          <div className="eyebrow_text u-text-style-main">
            REGISTRATION
          </div>
        </div>
      </div>
      <h1 id="registration-hero-title" className="registration-hero__title">
        CHOOSE YOUR PASS
      </h1>
      <p className="registration-hero__subtext">
        Access events • Proshows • Concerts
      </p>
      <RegistrationUrgency />
    </section>
  );
}
