"use client";
import React from "react";
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import "@/styles/globals.css";
import DefaultLayout from "@/layouts/default";
import { SessionProvider } from "next-auth/react";

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Core Game</title>
        <meta charSet="UTF-8" />
        <meta name="description" content="Webiste for CORE Game" />
        <meta name="author" content="Team Core Game" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <HeroUIProvider>
          <NextThemesProvider>
            <SessionProvider>
              <DefaultLayout>{children}</DefaultLayout>
            </SessionProvider>
          </NextThemesProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}
