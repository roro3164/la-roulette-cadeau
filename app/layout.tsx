import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "La roulette cadeau",
  description: "Roue de la fortune avec tirage côté serveur",
};

/** Échelle bien sur mobile ; `viewport-fit=cover` complète les `env(safe-area-inset-*)`. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="font-sans flex min-h-mobile-screen flex-col overflow-x-hidden antialiased [--safe-bottom:env(safe-area-inset-bottom,0px)] [--safe-top:env(safe-area-inset-top,0px)]">
        {children}
      </body>
    </html>
  );
}
