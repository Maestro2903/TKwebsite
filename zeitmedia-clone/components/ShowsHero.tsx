'use client';

import { ProshowsY2KHero } from '@/components/ProshowsY2KDecor';

export default function ShowsHero() {
  return (
    <section className="shows-hero u-section" aria-labelledby="shows-hero-title">
      <ProshowsY2KHero />
      <div className="shows-hero__content">
        <div className="eyebrow_wrap u-margin-bottom-4">
          <div className="eyebrow_layout">
            <div className="eyebrow_marker" aria-hidden />
            <div className="eyebrow_text u-text-style-main">
              PROSHOWS
            </div>
          </div>
        </div>
        <h1 id="shows-hero-title" className="shows-hero__title">
          THREE DAYS OF STARS
        </h1>
        <p className="shows-hero__subtext">
          Awards • Music • Dance • Concerts • DJ Night — CIT Takshashila
        </p>
      </div>
    </section>
  );
}
