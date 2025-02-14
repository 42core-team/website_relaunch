'use client'
import EventNavbar from "@/components/event-navbar";
import EventJoinNotice from "@/components/event-join-notice";
import React, {useEffect, useState} from "react";
import PocketBase from 'pocketbase';
import {useParams} from "next/navigation";

export default function EventLayout({children}: {
    children: React.ReactNode;
}) {
    const [showJoinNotice, setShowJoinNotice] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const eventId = useParams().id as string;

    useEffect(() => {
        const checkEventMembership = async () => {
            const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

            // Check if user is authenticated
            if (!pb.authStore.isValid || !pb.authStore.record) {
                new Error("User is not authenticated");
                return;
            }

            try {
                setUserId(pb.authStore.record.id);

                // Check if user is already part of the event
                const records = await pb.collection('event_user').getList(1, 1, {
                    filter: `event="${eventId}" && user="${userId}"`,
                });

                // Show notice if user is not part of the event
                setShowJoinNotice(records.items.length === 0);
            } catch (err) {
                console.error('Error checking event membership:', err);
            }
        };

        checkEventMembership();
    }, [eventId]);

    if(!eventId) {
        return <div>Event not found</div>;
    }

    return (
        <div className="relative flex flex-col h-screen">
            {showJoinNotice && userId && (
                <EventJoinNotice eventId={eventId} userId={userId}/>
            )}
            <EventNavbar eventId={eventId}/>
            <main className="container mx-auto max-w-7xl px-6 flex-grow">
                {children}
            </main>
        </div>
    );
}