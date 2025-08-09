import React from "react";
import type { Metadata } from "next";

import "@/styles/globals.css";
import DefaultLayout from "@/layouts/default";
import ClientProviders from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: {
    default: "CORE Game",
    template: "%s | CORE Game",
  },
  description:
    "CORE is a programming competition where you write a bot to compete against other players. Protect your core, spawn units, manage resources, and outsmart your opponents in this strategic coding challenge.",
  keywords: [
    "programming competition",
    "bot programming",
    "strategy game",
    "coding challenge",
    "game development",
    "competitive programming",
    "AI bots",
    "42 school",
  ],
  authors: [{ name: "Team Core Game" }],
  creator: "Team Core Game",
  publisher: "CORE Game",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://coregame.de"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXTAUTH_URL || "https://coregame.de",
    title: "CORE Game",
    description:
      "CORE is a programming competition where you write a bot to compete against other players. Protect your core, spawn units, manage resources, and outsmart your opponents in this strategic coding challenge.",
    siteName: "CORE Game",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "CORE Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CORE Game",
    description:
      "CORE is a programming competition where you write a bot to compete against other players. Protect your core, spawn units, manage resources, and outsmart your opponents in this strategic coding challenge.",
    images: ["/api/og"],
    creator: "@coregame",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "game",
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
