'use client'
import EventNavbar from "@/components/event-navbar";
import EventJoinNotice from "@/components/event-join-notice";
import React, {useEffect, useState} from "react";
import PocketBase from 'pocketbase';
import {useParams} from "next/navigation";
import { Event, getEventById, isUserRegisteredForEvent, shouldShowJoinNotice } from "@/app/actions/event";

export default function EventLayout({children}: {
    children: React.ReactNode;
}) {
    const [showJoinNotice, setShowJoinNotice] = useState(false);
    const [isUserRegistered, setIsUserRegistered] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [event, setEvent] = useState<Event | null>(null);
    const eventId = useParams().id as string;

    useEffect(() => {
        const fetchEventDetails = async () => {
            const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

            // Check if user is authenticated
            if (!pb.authStore.isValid || !pb.authStore.record) {
                new Error("User is not authenticated");
                return;
            }

            try {
                const currentUserId = pb.authStore.record.id;
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

        fetchEventDetails();
    }, [eventId]);

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