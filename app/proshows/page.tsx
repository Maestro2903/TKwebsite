'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ShowsHero from '@/components/sections/proshows/ShowsHero';
import StickyRegisterCTA from '@/components/layout/StickyRegisterCTA';
import { useLenis } from '@/hooks/useLenis';

// Code-split ShowsSchedule - it imports showsData
const ShowsSchedule = dynamic(() => import('@/components/sections/proshows/ShowsSchedule'), {
  loading: () => <div style={{ minHeight: '400px' }} />,
});

export default function ProshowsPage() {
  useLenis();

  return (
    <>
      <Navigation />

      <main id="main" className="page_main page_main--proshows">
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
