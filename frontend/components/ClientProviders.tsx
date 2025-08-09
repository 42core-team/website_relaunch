"use client";
import React from "react";
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { NavbarProvider } from "@/contexts/NavbarContext";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <HeroUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <SessionProvider>
          <NavbarProvider>{children}</NavbarProvider>
        </SessionProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
