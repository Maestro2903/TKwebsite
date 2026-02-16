import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Bebas_Neue, DM_Sans, Syne, Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "@/features/auth/AuthContext";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { LenisProvider } from "@/contexts/LenisContext";
import Navigation from "@/components/layout/Navigation";

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
  title: "CIT Takshashila | Innovation Meets Culture",
  description: "Chennai's Premier Techno-Cultural Fiesta. CIT Takshashila - Innovation Meets Culture. A grand annual spectacle of engineering brilliance and cultural vibrancy.",
  keywords: "CIT Takshashila, Chennai Institute of Technology, techno-cultural fest, Chennai, events, workshops, proshows",
  openGraph: {
    title: "CIT Takshashila | Innovation Meets Culture",
    description: "CIT Takshashila - Chennai's Premier Techno-Cultural Fiesta",
    type: "website",
  },
};

function AppContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
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
