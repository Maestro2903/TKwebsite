'use client';

/**
 * Cinematic Hero for Events Page
 * Full-bleed poster design with overlay and large typography
 */

export function EventsHero() {
  return (
    <section className="events-hero">
      <img
        src="/RCTKFINAL.webp"
        alt="Events"
        className="events-hero__background"
      />
      <div className="events-hero__overlay" />
    </section>
  );
}
