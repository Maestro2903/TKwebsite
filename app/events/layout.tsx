import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Events",
  description: "Explore technical and non-technical events at CIT Takshashila 2026. Participate in coding competitions, robotics challenges, cultural performances, and more.",
  openGraph: {
    title: "Events | CIT Takshashila 2026",
    description: "Explore technical and non-technical events at CIT Takshashila 2026. Participate in coding competitions, robotics challenges, cultural performances, and more.",
    url: "https://takshashila.cit.edu.in/events",
  },
  alternates: {
    canonical: "https://takshashila.cit.edu.in/events",
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
        "item": "https://takshashila.cit.edu.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Events",
        "item": "https://takshashila.cit.edu.in/events"
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
