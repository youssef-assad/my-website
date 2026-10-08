import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";

import { SmoothScroll } from "@/components/layout/smooth-scroll";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: "Youssef Assad — Web Dev & AI Integrator",
  description: "Web Dev & AI Integrator. Selected work and contact.",
  openGraph: {
    title: "Youssef Assad — Web Dev & AI Integrator",
    description: "Web Dev & AI Integrator. Selected work and contact.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Youssef Assad — Web Dev & AI Integrator",
    description: "Web Dev & AI Integrator. Selected work and contact.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${instrumentSerif.variable} bg-background text-foreground antialiased`}
      >
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
