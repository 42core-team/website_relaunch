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
