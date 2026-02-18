'use client';

import Footer from '@/components/layout/Footer';
import StickyRegisterCTA from '@/components/layout/StickyRegisterCTA';
import { CinematicProshowsLayout } from '@/components/sections/proshows/CinematicProshowsLayout';

export default function ProshowsPage() {
  return (
    <>
      <main id="main" className="page_main page_main--proshows">
        <CinematicProshowsLayout />
      </main>

      <Footer />

      <StickyRegisterCTA />
    </>
  );
}
