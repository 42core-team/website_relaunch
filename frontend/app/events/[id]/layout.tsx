import React from "react";
import EventLayout from "@/layouts/event";
import { getEventById } from "@/app/actions/event";
import { isActionError } from "@/app/actions/errors";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  if (isActionError(event)) {
    return {
      title: "Event Not Found",
      description: "This event could not be found on the CORE Game platform.",
    };
  }
  return {
    title: {
      default: `${event.name}`,
      template: `%s | ${event.name} | CORE Game`,
    },
    description:
      event.description || `Details for the ${event.name} event in CORE Game`,
    openGraph: {
      title: `${event.name}`,
      description:
        event.description || `Details for the ${event.name} event in CORE Game`,
      url: `/events/${id}`,
    },
    twitter: {
      card: "summary",
      title: `${event.name}`,
      description:
        event.description || `Details for the ${event.name} event in CORE Game`,
    },
  };
}

export default async function App({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  return <EventLayout params={await params}>{children}</EventLayout>;
}
