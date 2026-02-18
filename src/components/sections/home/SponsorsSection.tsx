'use client';

import Image from 'next/image';

const SPONSOR_LOGO_FILES = [
    'AGS.webp',
    'Aswins.webp',
    'Balaji photo frames.webp',
    'BIG fm_.webp',
    'chennai symposiums.webp',
    'Coldmok.webp',
    'DB productions.webp',
    'Deyga.webp',
    'Gamestry.webp',
    'Jan Enterprizes.webp',
    'K CLICKS STUDIO.webp',
    'Krafton.webp',
    'Kyn.webp',
    "Maker_s Cafe.webp",
    'Medimix.webp',
    'MGM health care.webp',
    'NAC.webp',
    'Pepsi.webp',
    'poorvika.webp',
    'Printex.webp',
    'Prithvi Prints_.webp',
    'Provoke.webp',
    'V - care.webp',
    'Vikatan.webp',
];

const SPONSORS_BASE = '/images/event/Sponsors';

function SponsorLogo({ filename }: { filename: string }) {
    const src = `${SPONSORS_BASE}/${encodeURIComponent(filename)}`;
    const alt = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    return (
        <div className="sponsors_marquee_logo">
            <Image
                src={src}
                alt={alt}
                width={640}
                height={256}
                loading="lazy"
                className="sponsors_marquee_logo_img"
                sizes="(max-width: 767px) 224px, 640px"
                unoptimized
            />
        </div>
    );
}

function MarqueeCollection() {
    return (
        <div data-marquee-collection-target="" className="marquee-advanced__collection sponsors_marquee_collection">
            {SPONSOR_LOGO_FILES.map((filename) => (
                <SponsorLogo key={filename} filename={filename} />
            ))}
        </div>
    );
}

export default function SponsorsSection() {
    return (
        <div className="u-section sponsors_section" style={{ overflow: 'hidden' }}>
            <div className="u-container">
                <h2 className="u-text-style-h2 u-margin-bottom-6">Sponsors</h2>
            </div>

            <div
                data-marquee-direction="left"
                className="marquee-advanced sponsors_marquee"
            >
                <div data-marquee-scroll-target="" className="marquee-advanced__scroll">
                    <MarqueeCollection />
                    <MarqueeCollection />
                    <MarqueeCollection />
                </div>
            </div>
        </div>
    );
}
