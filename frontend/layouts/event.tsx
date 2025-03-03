'use client'
import EventNavbar from "@/components/event-navbar";
import EventJoinNotice from "@/components/event-join-notice";
import React, {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import { Event, getEventById, isUserRegisteredForEvent, shouldShowJoinNotice } from "@/app/actions/event";
import { useSession } from "next-auth/react";

export default function EventLayout({children}: {
    children: React.ReactNode;
}) {
    const [showJoinNotice, setShowJoinNotice] = useState(false);
    const [isUserRegistered, setIsUserRegistered] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [event, setEvent] = useState<Event | null>(null);
    const eventId = useParams().id as string;
    const { data: session } = useSession();

    useEffect(() => {
        const fetchEventDetails = async () => {
            // Check if user is authenticated
            if (!session || !session.user || !session.user.id) {
                console.log("User is not authenticated");
                return;
            }

            try {
                const currentUserId = session.user.id;
                setUserId(currentUserId);

                // Get event details from server action
                const eventData = await getEventById(eventId);
                setEvent(eventData);

                // Check if user is registered using server action
                const userRegistered = await isUserRegisteredForEvent(currentUserId, eventId);
                setIsUserRegistered(userRegistered);

                // Check if join notice should be shown using server action
                const shouldShow = await shouldShowJoinNotice(currentUserId, eventId);
                setShowJoinNotice(shouldShow);
            } catch (err) {
                console.error('Error fetching event details:', err);
            }
        };

        if (session) {
            fetchEventDetails();
        }
    }, [eventId, session]);

    if(!eventId) {
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