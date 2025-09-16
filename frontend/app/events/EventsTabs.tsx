"use client";

import { Tab, Tabs } from "@heroui/react";
import EventsTable from "@/app/events/EventTable";
import { Event } from "@/app/actions/event";

export default function EventsTabs({
  myEvents,
  allEvents,
  isLoggedIn,
}: {
  myEvents: Event[];
  allEvents: Event[];
  isLoggedIn: boolean;
}) {
  if (!isLoggedIn) {
    return <EventsTable events={allEvents} />;
  }
  return (
    <Tabs
      aria-label="Events tabs"
      className="w-full ps-1.5 pb-0.5"
      defaultSelectedKey={myEvents.length ? "my" : "all"}
    >
      <Tab key="my" title={`My Events (${myEvents.length})`}>
        <EventsTable events={myEvents} />
      </Tab>
      <Tab key="all" title={`All Events (${allEvents.length})`}>
        <EventsTable events={allEvents} />
      </Tab>
    </Tabs>
  );
}
