'use client';

import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import StickyRegisterCTA from '@/components/layout/StickyRegisterCTA';
import { ProshowsEditorialLayout } from '@/components/sections/proshows/ProshowsEditorialLayout';

export default function ProshowsPage() {
  return (
    <>
      <Navigation />

      <main id="main" className="page_main page_main--proshows">
        <ProshowsEditorialLayout />
      </main>

      <Footer />

      <StickyRegisterCTA />
    </>
  );
}
