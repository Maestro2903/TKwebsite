import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Event Rules",
  description: "Read the official rules and guidelines for all events at CIT Takshashila 2026. Understand participation criteria, judging criteria, and event-specific regulations.",
  openGraph: {
    title: "Event Rules | CIT Takshashila 2026",
    description: "Read the official rules and guidelines for all events at CIT Takshashila 2026. Understand participation criteria, judging criteria, and event-specific regulations.",
    url: "https://takshashila.cit.edu.in/events-rules",
  },
  alternates: {
    canonical: "https://takshashila.cit.edu.in/events-rules",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
