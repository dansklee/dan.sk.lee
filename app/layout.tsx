import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Courier_Prime,
  EB_Garamond,
  Pinyon_Script,
} from "next/font/google";

import { wedding } from "@/data/wedding";
import "./globals.css";

const body = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const display = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const script = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

const mono = Courier_Prime({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${wedding.couple} · ${wedding.dateLabel}`,
  description: `${wedding.couple} are getting married in ${wedding.location} on ${wedding.dateLabel}.`,
  openGraph: {
    title: `${wedding.couple}`,
    description: `${wedding.location} · ${wedding.dateLabel}`,
    type: "website",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#4E5139",
  // Lets the page paint into the notch area; safe-area insets keep the
  // navigator clear of the home indicator.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} ${script.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
