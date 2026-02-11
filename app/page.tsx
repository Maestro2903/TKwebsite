'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/home/HeroSection';
import AboutSection from '@/components/sections/home/AboutSection';
import FeaturedClientsSection from '@/components/sections/home/FeaturedClientsSection';
import MarqueeSection from '@/components/sections/home/MarqueeSection';
import ScalingVideoSection from '@/components/sections/home/ScalingVideoSection';
import Lightbox from '@/components/ui/Lightbox';

const ServicesAndWorksSection = dynamic(() => import('@/components/sections/home/ServicesAndWorksSection'), {
  loading: () => <div style={{ minHeight: '800px' }} />,
});

const SponsorsSection = dynamic(() => import('@/components/sections/home/SponsorsSection'), {
  loading: () => <div style={{ minHeight: '240px' }} />,
});

const CTASection = dynamic(() => import('@/components/sections/home/CTASection'), {
  loading: () => <div style={{ minHeight: '500px' }} />,
});

export default function Home() {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const showReelSrc = 'https://vz-bf52cb50-0a5.b-cdn.net/ce1749fb-077d-416a-8df8-bc32ac669c3c/playlist.m3u8';

  return (
    <>
      <Navigation />

      <main id="main" className="page_main">
        {/* 1. Hero Section - Full-screen with video background */}
        <HeroSection onShowReelClick={() => setIsLightboxOpen(true)} />

        {/* 2. About Section - "Vietnam's leading creative agency" with parallax stats */}
        <AboutSection />

        {/* 3. Featured Clients - Ministry names and brand logos with text animation */}
        <FeaturedClientsSection />

        {/* 4. Marquee Section - Infinite scroll with images + Scaling Video Small Box */}
        <MarqueeSection />

        {/* 5. Scaling Video Section - "Ready to Create Your Brand Breakthrough?" */}
        <ScalingVideoSection />

        {/* 6. Services & Works Section - Combined section with:
            - "What we do" heading
            - Works grid with 6 project cards
            - Service Cards (Events, Marketing, Design, Production)
        */}
        <ServicesAndWorksSection />

        {/* Sponsors – marquee of sponsor logos */}
        <SponsorsSection />

        {/* 7. CTA Section - "Let's Create Something Extraordinary" with 3D effect */}
        <CTASection />
      </main>

      <Footer />

      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        videoSrc={showReelSrc}
      />
    </>
  );
}
