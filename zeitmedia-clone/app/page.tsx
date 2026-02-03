'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import FeaturedClientsSection from '@/components/FeaturedClientsSection';
import MarqueeSection from '@/components/MarqueeSection';
import ScalingVideoSection from '@/components/ScalingVideoSection';
import ServicesAndWorksSection from '@/components/ServicesAndWorksSection';
import SponsorsSection from '@/components/SponsorsSection';
import CTASection from '@/components/CTASection';
import Lightbox from '@/components/Lightbox';
import { useLenis } from '@/hooks/useLenis';

export default function Home() {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const showReelSrc = 'https://vz-bf52cb50-0a5.b-cdn.net/ce1749fb-077d-416a-8df8-bc32ac669c3c/playlist.m3u8';

  // Initialize smooth scrolling
  useLenis();

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
