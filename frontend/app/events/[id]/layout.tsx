import React from "react";
import {HeroUIProvider} from "@heroui/system";
import {ThemeProvider as NextThemesProvider} from "next-themes";
import DefaultLayout from "@/layouts/default";
import EventLayout from "@/layouts/event";

export default function App({children}: {
    children: React.ReactNode
}) {

    return (
        <EventLayout>
            {children}
        </EventLayout>
    );
}