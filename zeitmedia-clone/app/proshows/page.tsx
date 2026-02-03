'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ShowsHero from '@/components/ShowsHero';
import ShowsSchedule from '@/components/ShowsSchedule';
import StickyRegisterCTA from '@/components/StickyRegisterCTA';
import { ProshowsY2KPage } from '@/components/ProshowsY2KDecor';
import { useLenis } from '@/hooks/useLenis';

export default function ProshowsPage() {
  useLenis();

  return (
    <>
      <Navigation />

      <main id="main" className="page_main page_main--proshows">
        <ProshowsY2KPage />
        <ShowsHero />

        <div
          data-wf--spacer--section-space="main"
          className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
        />

        <ShowsSchedule />

        <div
          data-wf--spacer--section-space="main"
          className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
        />
      </main>

      <Footer />

      <StickyRegisterCTA />
    </>
  );
}
