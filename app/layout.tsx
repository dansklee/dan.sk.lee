import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Courier_Prime,
  Pinyon_Script,
  Playfair_Display,
} from "next/font/google";

import { wedding } from "@/data/wedding";
import "./globals.css";

const body = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const display = Playfair_Display({
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
