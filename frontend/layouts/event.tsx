import EventNavbar from "@/components/event-navbar";
import EventJoinNotice from "@/components/event-join-notice";
import React from "react";
import {getEventById, isUserRegisteredForEvent, shouldShowJoinNotice} from "@/app/actions/event";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/utils/authOptions";

export default async function EventLayout({
                                              children,
                                              params,
                                          }: {
    children: React.ReactNode;
    params: { id: string };
}) {
    const eventId = params.id
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    let showJoinNotice = false;
    let isUserRegistered = false;
    let event = null;

    if (userId) {
        event = await getEventById(eventId);

        isUserRegistered = await isUserRegisteredForEvent(userId, eventId);

        showJoinNotice = await shouldShowJoinNotice(userId, eventId);
    }

    if (!event) {
        return <div>Event not found</div>;
    }

    return (
        <div className="relative flex flex-col h-screen">
            {showJoinNotice && userId && (
                <EventJoinNotice eventId={eventId} userId={userId}/>
            )}
            <EventNavbar eventId={eventId} isUserRegistered={isUserRegistered}/>
            <main className="container mx-auto max-w-7xl px-6 flex-grow">
                {children}
            </main>
        </div>
    );
}