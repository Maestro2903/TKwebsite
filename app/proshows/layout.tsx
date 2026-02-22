import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Proshows",
  description: "Experience electrifying proshows at CIT Takshashila 2026. Featuring top artists, live performances, and unforgettable entertainment across multiple days.",
  openGraph: {
    title: "Proshows | CIT Takshashila 2026",
    description: "Experience electrifying proshows at CIT Takshashila 2026. Featuring top artists, live performances, and unforgettable entertainment across multiple days.",
    url: "https://cittakshashila.org/proshows",
  },
  alternates: {
    canonical: "https://cittakshashila.org/proshows",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
