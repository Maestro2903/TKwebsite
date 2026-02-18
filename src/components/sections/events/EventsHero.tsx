'use client';

/**
 * Cinematic Hero for Events Page
 * Full-bleed poster design with overlay and large typography
 */

export function EventsHero() {
  return (
    <section className="events-hero">
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet="/events-page-hero-mobile.webp"
        />
        <img
          src="/events-page-hero.webp"
          alt="Events"
          className="events-hero__background"
        />
      </picture>
      <div className="events-hero__overlay" />
    </section>
  );
}
