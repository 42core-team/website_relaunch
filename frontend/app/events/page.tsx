"use client";

import { Button } from "@heroui/react";
import { title } from "@/components/primitives";
import { getEvents, Event, canUserCreateEvent } from "@/app/actions/event";
import EventsTable from "@/app/events/EventTable";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canCreate, setCanCreate] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedEvents, hasPermission] = await Promise.all([
          getEvents(50),
          canUserCreateEvent(),
        ]);

        setEvents(fetchedEvents);
        setCanCreate(hasPermission);
      } catch (err) {
        setError("Failed to fetch events");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleCreateEvent = () => {
    router.push("/events/create");
  };

  if (isLoading) {
    return <div className="text-center">Loading events...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

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
          <Button color="primary" onPress={handleCreateEvent}>
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
