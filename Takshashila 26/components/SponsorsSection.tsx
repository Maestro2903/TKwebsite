'use client';

const SPONSOR_LOGO_FILES = [
    'AGS.png',
    'Aswins.png',
    'Balaji photo frames.png',
    'BIG fm_.png',
    'chennai symposiums.png',
    'Coldmok.png',
    'DB productions.png',
    'Deyga.png',
    'Gamestry.png',
    'Jan Enterprizes.png',
    'K CLICKS STUDIO.png',
    'Krafton.png',
    'Kyn.png',
    "Maker_s Cafe.png",
    'Medimix.png',
    'MGM health care.png',
    'NAC.png',
    'Pepsi.png',
    'poorvika.png',
    'Printex.png',
    'Prithvi Prints_.png',
    'Provoke.png',
    'V - care.png',
    'Vikatan.png',
];

const SPONSORS_BASE = '/images/event/Sponsors';

function SponsorLogo({ filename }: { filename: string }) {
    const src = `${SPONSORS_BASE}/${encodeURIComponent(filename)}`;
    const alt = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    return (
        <div className="sponsors_marquee_logo">
            <img src={src} alt={alt} loading="lazy" className="sponsors_marquee_logo_img" />
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
            <div
                data-wf--spacer--section-space="main"
                className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
            />

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

            <div
                data-wf--spacer--section-space="main"
                className="u-section-spacer w-variant-60a7ad7d-02b0-6682-95a5-2218e6fd1490 u-ignore-trim"
            />
        </div>
    );
}
