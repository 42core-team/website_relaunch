import EventNavbar from "@/components/event-navbar";
import EventJoinNotice from "@/components/event-join-notice";
import React from "react";
import {
  getEventById,
  isEventAdmin,
  isUserRegisteredForEvent,
  shouldShowJoinNotice,
} from "@/app/actions/event";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";
import { isActionError } from "@/app/actions/errors";

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const eventId = params.id;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="text-center p-8 shadow-sm">
          <h2 className="text-2xl font-semibold  mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-300">Please sign in to view this event</p>
        </div>
      </div>
    );
  }

  const event = await getEventById(eventId);
  if (isActionError(event))
    return (
      <div className="container mx-auto max-w-7xl px-6">
        Error: {event.error}
      </div>
    );

  const isEventAdminState = await isEventAdmin(eventId);
  const isUserRegistered = await isUserRegisteredForEvent(eventId);
  const showJoinNotice = await shouldShowJoinNotice(eventId);

  if (isActionError(isEventAdminState) || isActionError(isUserRegistered)) {
    return (
      <div className="container mx-auto max-w-7xl px-6">
        Error: Unable to fetch event details.
      </div>
    );
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="relative flex flex-col min-h-lvh">
      {showJoinNotice && userId && (
        <EventJoinNotice eventId={eventId} userId={userId} />
      )}
      <EventNavbar
        event={event}
        eventId={eventId}
        isUserRegistered={isUserRegistered}
        isEventAdmin={isEventAdminState}
      />
      <main className="container mx-auto max-w-7xl px-6 flex-grow">
        {children}
      </main>
    </div>
  );
}
