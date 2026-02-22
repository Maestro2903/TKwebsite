import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sana Arena",
  description: "Experience Santhosh Narayanan live at CIT Takshashila 2026. An exclusive concert featuring the legendary music composer's greatest hits in an unforgettable arena experience.",
  openGraph: {
    title: "Sana Arena | CIT Takshashila 2026",
    description: "Experience Santhosh Narayanan live at CIT Takshashila 2026. An exclusive concert featuring the legendary music composer's greatest hits in an unforgettable arena experience.",
    url: "https://takshashila.cit.edu.in/sana-arena",
  },
  alternates: {
    canonical: "https://takshashila.cit.edu.in/sana-arena",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
