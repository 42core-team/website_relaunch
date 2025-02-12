import { useEffect, useState } from 'react';
import PocketBase from 'pocketbase';
import DefaultLayout from '@/layouts/default';
import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
} from "@heroui/react";
import { title } from '@/components/primitives';
import { Link } from '@heroui/react';

interface Event {
    collectionId: string;
    collectionName: string;
    id: string;
    name: string;
    start_date: string;
    min_team_size: number;
    max_team_size: number;
    created: string;
    updated: string;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
                const records = await pb.collection('events').getList(1, 50, {
                    sort: '-created',
                });
                setEvents(records.items as Event[]);
            } catch (err) {
                setError('Failed to fetch events');
                console.error('Error fetching events:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const content = () => {
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
                    <Table
                        aria-label="Events table"
                    >
                        <TableHeader>
                            <TableColumn>Name</TableColumn>
                            <TableColumn>Start Date</TableColumn>
                            <TableColumn>Team Size</TableColumn>
                        </TableHeader>
                        <TableBody
                            items={events}
                            emptyContent={loading ? "Loading..." : "No events found"}
                            isLoading={loading}
                        >
                            {(event) => (
                                <TableRow
                                    key={event.id}
                                    onClick={() => window.location.href = `/events/${event.id}`}
                                    className="cursor-pointer transition-colors hover:bg-default-100"
                                >
                                    <TableCell>{event.name}</TableCell>
                                    <TableCell>{new Date(event.start_date).toLocaleDateString()}</TableCell>
                                    <TableCell>{event.min_team_size} - {event.max_team_size} members</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </>
        );
    };

    return (
        <DefaultLayout>
            {content()}
        </DefaultLayout>
    );
}
