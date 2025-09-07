import { title } from "@/components/primitives";
import { getEvents, canUserCreateEvent, getMyEvents } from "@/app/actions/event";
import EventsTabs from "@/app/events/EventsTabs";
import { Button } from "@/components/clientHeroui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description: "Browse, join, and create events in CORE Game.",
  openGraph: {
    title: "Events",
    description: "Browse, join, and create events in CORE Game.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Events",
    description: "Browse, join, and create events in CORE Game.",
  },
};

async function getData() {
  const [allEvents, myEvents, canCreate] = await Promise.all([
    getEvents(),
    getMyEvents(),
    canUserCreateEvent(),
  ]);

  return { allEvents, myEvents, canCreate };
}

export default async function EventsPage() {
  const { allEvents, myEvents, canCreate } = await getData();

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="flex flex-row items-center justify-center">
          <h1 className={title()}>Events</h1>
        </div>
        <p className="text-lg text-default-600">
          Discover and join upcoming coding competitions
        </p>
        {canCreate && (
          <Button color="primary" as={Link} href="/events/create">
            Create Event
          </Button>
        )}
      </div>
      <div className="mt-8">
        <EventsTabs myEvents={myEvents} allEvents={allEvents} />
      </div>
    </>
  );
}
