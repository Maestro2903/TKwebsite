import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Events",
  description: "Explore technical and non-technical events at CIT Takshashila 2026. Participate in coding competitions, robotics challenges, cultural performances, and more.",
  openGraph: {
    title: "Events | CIT Takshashila 2026",
    description: "Explore technical and non-technical events at CIT Takshashila 2026. Participate in coding competitions, robotics challenges, cultural performances, and more.",
    url: "https://cittakshashila.org/events",
  },
  alternates: {
    canonical: "https://cittakshashila.org/events",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://cittakshashila.org"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Events",
        "item": "https://cittakshashila.org/events"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
