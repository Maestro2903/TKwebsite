import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/features/auth/AuthContext";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { LenisProvider } from "@/contexts/LenisContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "CIT Takshashila | Innovation Meets Culture",
  description: "Chennai's Premier Techno-Cultural Fiesta. CIT Takshashila - Innovation Meets Culture. A grand annual spectacle of engineering brilliance and cultural vibrancy.",
  keywords: "CIT Takshashila, Chennai Institute of Technology, techno-cultural fest, Chennai, events, workshops, proshows",
  openGraph: {
    title: "CIT Takshashila | Innovation Meets Culture",
    description: "CIT Takshashila - Chennai's Premier Techno-Cultural Fiesta",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LenisProvider>
          <ClientLayout>
            <AuthProvider>{children}</AuthProvider>
          </ClientLayout>
        </LenisProvider>
      </body>
    </html>
  );
}
