import { title } from "@/components/primitives";
import { getEvents, canUserCreateEvent } from "@/app/actions/event";
import EventsTable from "@/app/events/EventTable";
import { Button, Spinner } from "@/components/clientHeroui";
import Link from "next/link";
import { Suspense } from 'react';

export const experimental_ppr = true;

async function CreateEventButton() {
  const canCreate = await canUserCreateEvent();

  if (!canCreate) return null;

  return (
    <Button color="primary" as={Link} href="/events/create">
      Create Event
    </Button>
  );
}

async function EventsTableContent() {
  const events = await getEvents();

  return <EventsTable events={events} />;
}

export default function EventsPage() {
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="flex flex-row items-center justify-center">
          <h1 className={title()}>Events</h1>
        </div>
        <p className="text-lg text-default-600">
          Discover and join upcoming coding competitions
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <Suspense fallback={null}>
          <CreateEventButton />
        </Suspense>
      </div>

      <Suspense fallback={<Spinner size="lg" className="mt-8 flex justify-center items-center py-12"/>}>
        <EventsTableContent />
      </Suspense>
    </>
  );
}
