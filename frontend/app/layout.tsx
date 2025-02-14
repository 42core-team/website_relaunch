import React from "react";
import {HeroUIProvider} from "@heroui/system";
import {ThemeProvider as NextThemesProvider} from "next-themes";

import "@/styles/globals.css";
import DefaultLayout from "@/layouts/default";

export default function App({children}: {
    children: React.ReactNode
}) {

    return (
        <html lang="en">
        <body>
        <HeroUIProvider>
            <NextThemesProvider>
                <DefaultLayout>
                    {children}
                </DefaultLayout>
            </NextThemesProvider>
        </HeroUIProvider>
        </body>
        </html>
    );
}