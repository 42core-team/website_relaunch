import React from "react";
import type { Metadata } from "next";

import "@/styles/globals.css";
import DefaultLayout from "@/layouts/default";
import ClientProviders from "@/components/ClientProviders";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL ?? "https://coregame.de",
  ),
  title: {
    default: "CORE Game",
    template: "%s | CORE Game",
  },
  description:
    "Official homepage of CORE Game, the strategic programming competition where you develop bots to outsmart opponents.",
  keywords: [
    "programming competition",
    "bot programming",
    "42 school",
    "strategy game",
    "coding challenge",
    "coding game",
  ],
  openGraph: {
    title: "Home - CORE Game",
    description:
      "Official homepage of CORE Game, the strategic programming competition where you develop bots to outsmart opponents.",
    type: "website",
    images: [
      {
        url: "/CORE-LOGO.svg",
        alt: "CORE Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Home - CORE Game",
    description:
      "Official homepage of CORE Game, the strategic programming competition where you develop bots to outsmart opponents.",
    images: ["/CORE-LOGO.svg"],
  },
  category: "coding game",
};

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientProviders>
          <DefaultLayout>{children}</DefaultLayout>
        </ClientProviders>
      </body>
    </html>
  );
}
