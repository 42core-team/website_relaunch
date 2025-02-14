'use client'

import {Card} from "@heroui/react";
import {useParams, useRouter} from "next/navigation";
import PocketBase from 'pocketbase';
import {useState, useEffect} from 'react';
import EventLayout from "@/layouts/event";

interface Event {
    collectionId: string;
    collectionName: string;
    created: string;
    id: string;
    max_team_size: number;
    min_team_size: number;
    name: string;
    description: string;
    location: string;
    start_date: string;
    end_date: string;
    updated: string;
}

interface Stats {
    totalParticipants: number;
    totalTeams: number;
}

export default function EventPage() {
    const router = useRouter();
    const id = useParams().id;

    const [event, setEvent] = useState<Event | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchEventStats() {
            if (!id) return;

            try {
                const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

                const event = await pb.collection('events').getOne(id as string);
                const teams = await pb.collection('teams').getList(1, 1, {
                    filter: `event = "${id}"`,
                });
                const participants = await pb.collection('event_user').getList(1, 1, {
                    filter: `event = "${id}"`,
                });

                setEvent(event as Event);
                setStats({
                    totalParticipants: participants.totalItems,
                    totalTeams: teams.totalItems,
                });
            } catch (error) {
                console.error('Error fetching event stats:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchEventStats();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <p>Loading event stats...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <p>No event data found</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">{event.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Participants</h3>
                    <p className="text-3xl font-bold">{stats?.totalParticipants}</p>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Teams</h3>
                    <p className="text-3xl font-bold">{stats?.totalTeams}</p>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Location</h3>
                    <p className="text-xl">{event.location}</p>
                </Card>
            </div>

            <Card className="p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Description</h3>
                        <p className="mt-1">{event.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                            <p className="mt-1">
                                {new Date(event.start_date).toLocaleDateString('de-DE')}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
