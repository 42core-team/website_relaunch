import EventNavbar from "@/components/event-navbar";
import EventJoinNotice from "@/components/event-join-notice";
import React from "react";
import {getEventById, isEventAdmin, isUserRegisteredForEvent, shouldShowJoinNotice} from "@/app/actions/event";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/utils/authOptions";
import { events_type_enum } from "@/generated/prisma";

export default async function EventLayout({
                                              children,
                                              params,
                                          }: {
    children: React.ReactNode;
    params: { id: string };
}) {
    const eventId = params.id
    const session = await getServerSession(authOptions);
    let isEventAdminState = false;
    const userId = session?.user?.id;

    let showJoinNotice = false;
    let isUserRegistered = false;
    let event = null;

    event = await getEventById(eventId);
    
    if (userId) {
        isEventAdminState = await isEventAdmin(session.user.id, eventId)
        isUserRegistered = await isUserRegisteredForEvent(userId, eventId);

        showJoinNotice = await shouldShowJoinNotice(userId, eventId);
    }

    if (!event) {
        return <div>Event not found</div>;
    }
    
    const isRushEvent = event.event_type === events_type_enum.RUSH;

    return (
        <div className="relative flex flex-col h-screen">
            {showJoinNotice && userId && (
                <EventJoinNotice eventId={eventId} userId={userId}/>
            )}
            <EventNavbar 
                eventId={eventId} 
                isUserRegistered={isUserRegistered} 
                isEventAdmin={isEventAdminState}
                isRushEvent={isRushEvent}
            />
            <main className="container mx-auto max-w-7xl px-6 flex-grow">
                {children}
            </main>
        </div>
    );
}