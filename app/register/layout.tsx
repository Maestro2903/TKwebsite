import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Register",
  description: "Register for CIT Takshashila 2026 and get your event pass. Choose from individual or group passes and unlock access to all events, proshows, and exclusive experiences.",
  openGraph: {
    title: "Register | CIT Takshashila 2026",
    description: "Register for CIT Takshashila 2026 and get your event pass. Choose from individual or group passes and unlock access to all events, proshows, and exclusive experiences.",
    url: "https://cittakshashila.org/register",
  },
  alternates: {
    canonical: "https://cittakshashila.org/register",
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
        "name": "Register",
        "item": "https://cittakshashila.org/register"
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
