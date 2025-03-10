import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
} from "@heroui/react";
import { title } from '@/components/primitives';
import { getEvents, Event } from '@/app/actions/event';
import Link from 'next/link';
import EventsTable from "@/app/events/EventTable";

export default async function EventsPage() {
    let events: Event[] = [];
    let error: string | null = null;

    try {
        events = await getEvents(50);
    } catch (err) {
        error = 'Failed to fetch events';
        console.error('Error fetching events:', err);
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
            </div>
            <div className="mt-8">
                <EventsTable events={events} />
            </div>
        </>
    );
}

