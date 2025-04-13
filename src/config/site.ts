import type { Metadata } from "next";

export const SITE_CONFIG: Metadata & Record<string, unknown> = {
  applicationName: "Kapi.run",
  title: {
    template: "Kapi.run - %s",
    default: "Kapi.run - Team Food Ordering",
  },
  description: "Simplify team food ordering with Kapi.run",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://kapi.run"),
  icons: {
    icon: "/kapi.svg",
  },
  creator: "Aryakumar Jha",
  // authors: [
  //   {
  //     name: "Aryakumar Jha",
  //     url: "https://aryak.dev",
  //   },
  // ],
} as const;
