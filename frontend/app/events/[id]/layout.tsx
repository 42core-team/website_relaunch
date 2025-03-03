import React from "react";
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