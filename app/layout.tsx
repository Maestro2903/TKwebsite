import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "@/features/auth/AuthContext";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { LenisProvider } from "@/contexts/LenisContext";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

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
    <html lang="en" className={spaceGrotesk.variable}>
      <body className={spaceGrotesk.className}>
        <LenisProvider>
          <ClientLayout>
            <AuthProvider>{children}</AuthProvider>
          </ClientLayout>
        </LenisProvider>
      </body>
    </html>
  );
}
