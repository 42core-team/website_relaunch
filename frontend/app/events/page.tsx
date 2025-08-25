import { title } from "@/components/primitives";
import { getEvents, canUserCreateEvent } from "@/app/actions/event";
import EventsTable from "@/app/events/EventTable";
import { Button } from "@/components/clientHeroui";
import Link from "next/link";

async function getData() {
  const [events, canCreate] = await Promise.all([
    getEvents(),
    canUserCreateEvent(),
  ]);

  return { events, canCreate };
}

export default async function EventsPage() {
  const { events, canCreate } = await getData();

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
        <EventsTable events={events} />
      </div>
    </>
  );
}
