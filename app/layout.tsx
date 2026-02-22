import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Bebas_Neue, DM_Sans, Syne, Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "@/features/auth/AuthContext";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { LenisProvider } from "@/contexts/LenisContext";
import { Navbar } from "@/components/layout/Navbar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://cittakshashila.org'),
  title: {
    default: "CIT Takshashila 2026 – Where Talent Meets the Spotlight",
    template: "%s | CIT Takshashila 2026",
  },
  description: "CIT Takshashila 2026 is Chennai's premier inter-college cultural and technical fest featuring proshows, competitions, group events, and exclusive concert experiences.",
  keywords: "CIT Takshashila 2026, Chennai college fest, CIT fest, engineering college events, proshows Chennai, technical symposium, cultural fest Chennai",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://cittakshashila.org",
    siteName: "CIT Takshashila 2026",
    title: "CIT Takshashila 2026 – Where Talent Meets the Spotlight",
    description: "CIT Takshashila 2026 is Chennai's premier inter-college cultural and technical fest featuring proshows, competitions, group events, and exclusive concert experiences.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CIT Takshashila 2026 – Where Talent Meets the Spotlight",
    description: "CIT Takshashila 2026 is Chennai's premier inter-college cultural and technical fest featuring proshows, competitions, group events, and exclusive concert experiences.",
  },
};

function AppContent({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CIT Takshashila",
    "url": "https://cittakshashila.org",
    "logo": "https://cittakshashila.org/logo.png",
    "sameAs": [
      "https://www.instagram.com/takshashila_cit",
      "https://www.linkedin.com/school/chennai-institute-of-technology"
    ]
  };

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "CIT Takshashila 2026",
    "description": "Chennai's premier inter-college cultural and technical fest featuring proshows, competitions, group events, and exclusive concert experiences",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": "Chennai Institute of Technology",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Chennai",
        "addressRegion": "Tamil Nadu",
        "addressCountry": "IN"
      }
    },
    "startDate": "2026-03-01",
    "endDate": "2026-03-03",
    "organizer": {
      "@type": "Organization",
      "name": "CIT Takshashila",
      "url": "https://cittakshashila.org"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://cittakshashila.org/register",
      "price": "299",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <Navbar />
      <div id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </div>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${bebasNeue.variable} ${dmSans.variable} ${syne.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={dmSans.className}>
        <LenisProvider>
          <ClientLayout>
            <AuthProvider>
              <AppContent>{children}</AppContent>
            </AuthProvider>
          </ClientLayout>
        </LenisProvider>
      </body>
    </html>
  );
}
