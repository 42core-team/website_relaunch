import type {Metadata} from "next";
import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
    title: "CORE Game",
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
    openGraph: {
        title: "CORE Game",
        description:
            "CORE is a programming competition where you write a bot to compete against other players. Protect your core, spawn units, manage resources, and outsmart your opponents in this strategic coding challenge.",
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
    },
    alternates: {
        canonical: "/",
    },
};

export default async function HomePage() {
    return <HomePageClient/>;
}
