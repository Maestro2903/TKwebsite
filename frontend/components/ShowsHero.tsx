'use client';

import { ProshowsY2KHero } from '@/components/ProshowsY2KDecor';

export default function ShowsHero() {
  return (
    <section className="shows-hero u-section" aria-labelledby="shows-hero-title">
      <ProshowsY2KHero />
      <div className="shows-hero__content">
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
