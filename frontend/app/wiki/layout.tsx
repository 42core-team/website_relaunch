"use client";
import React from "react";
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { Head } from "@/layouts/head";

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>CORE Wiki</title>
        <meta charSet="UTF-8" />
        <meta name="description" content="Documentation for CORE Game" />
        <meta name="author" content="Team Core Game" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <HeroUIProvider>
          <NextThemesProvider>
            <SessionProvider>
              <div className="min-h-lvh">
                <Head />
                {children}
              </div>
            </SessionProvider>
          </NextThemesProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}
