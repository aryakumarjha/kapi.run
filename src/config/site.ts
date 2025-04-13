import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kapi.run";

export const SITE_CONFIG: Metadata & Record<string, unknown> = {
  applicationName: "Kapi.run",
  title: {
    template: "Kapi.run - %s",
    default: "Kapi.run - Team Food Ordering",
  },
  description: "Simplify team food ordering with Kapi.run",
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: "/kapi.svg",
  },
  creator: "Aryakumar Jha",
  openGraph: {
    siteName: "Kapi.run",
    title: "Kapi.run - Team Food Ordering",
    description: "Simplify team food ordering with Kapi.run",
    url: BASE_URL,
    images: `${BASE_URL}/og.png`,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    images: [`${BASE_URL}/twitter.png`],
    card: "summary_large_image",
    title: "Kapi.run - Team Food Ordering",
    description: "Simplify team food ordering with Kapi.run",
  },
} as const;
