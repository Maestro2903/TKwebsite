'use client';

import { RadialGradientBg } from "@/components/ui/tailwind-css-background-snippet";

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden pt-20 pb-8">
      <h2 className="sr-only">Footer</h2>

      {/* Decorative Divider */}
      <div className="w-full border-t border-white/[0.08] mb-16" />

      {/* Background - blue radial gradient from snippet */}
      <RadialGradientBg variant="blue" />

      {/* Main content */}
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-32">

          {/* Left Column: Explore & Links */}
          <div className="flex flex-col gap-8">
            <span className="text-[0.7rem] font-medium uppercase tracking-wider text-white/50">
              Explore
            </span>
            <ul className="flex flex-col gap-4">
              {['HOME', 'EVENTS', 'SANA THE ONE', 'REGISTER', 'EVENTS RULES'].map((item, i) => {
                let href = '/';
                if (item === 'HOME') href = '/';
                else if (item === 'SANA THE ONE') href = '/sana-arena';
                else href = `/${item.toLowerCase().replace(/ /g, '-')}`;

                return (
                  <li key={i}>
                    <a href={href}
                      className="group relative inline-block text-[1.1rem] text-white/70 hover:text-white hover:tracking-wide transition-all duration-300">
                      {item}
                      <span className="absolute left-0 bottom-[-4px] h-[1px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Right Column: Address, Contact, Social */}
          <div className="flex flex-col gap-8">

            {/* Address */}
            <div className="flex flex-col gap-4">
              <h4 className="text-[0.75rem] tracking-[0.15em] opacity-50 uppercase text-white">Address</h4>
              <div className="text-white/70 leading-[1.6]">
                <p>Chennai Institute of Technology</p>
                <p>Sarathy Nagar, Kundrathur, Chennai - 600069.</p>
              </div>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-4">
              <h4 className="text-[0.75rem] tracking-[0.15em] opacity-50 uppercase text-white">Contact</h4>
              <div className="flex flex-col gap-2 text-white/90">
                <a href="tel:+919940199440" className="hover:text-white transition-colors text-sm">
                  +91 99401 99440 - Navin Athreya
                </a>
                <a href="tel:+919840998125" className="hover:text-white transition-colors text-sm">
                  +91 98409 98125 - Vishnu
                </a>
              </div>
            </div>

            {/* Social */}
            <div>
              <a
                href="https://www.instagram.com/cittakshashila/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-all hover:bg-white hover:text-black hover:scale-110"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>

          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="mt-20 border-t border-white/10 pt-8">
        <div className="mx-auto max-w-[900px] px-4 text-center">
          <p className="text-xs uppercase tracking-wider text-white/50">
            © {new Date().getFullYear()} CIT TAKSHASHILA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
