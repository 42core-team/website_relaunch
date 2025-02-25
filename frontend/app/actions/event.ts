'use server'

import pbAdmin from "@/pbaseAdmin";

export interface Event {
    id: string;
    start_date: string;
    name: string;
    description?: string;
    location?: string;
    end_date: string;
    min_team_size: number;
    max_team_size: number;
}

export async function getEventById(eventId: string): Promise<Event | null> {
    return await pbAdmin.collection('events').getOne<Event>(eventId);
}

export async function isUserRegisteredForEvent(userId: string, eventId: string): Promise<boolean> {
    const records = await pbAdmin.collection('event_user').getList(1, 1, {
        filter: `event="${eventId}" && user="${userId}"`,
    });
    return records.items.length > 0;
}

// Determine if join notice should be shown
export async function shouldShowJoinNotice(userId: string, eventId: string): Promise<boolean> {
    const isRegistered = await isUserRegisteredForEvent(userId, eventId);
    console.log(isRegistered)
    if (isRegistered)
        return false;

    // Get event details to check start date
    const event = await getEventById(eventId);
    if (!event) {
        console.log("no event")
        return false;
    }

    // Check if event didn't start yet
    const startDate = new Date(event.start_date);
    const isStartDateInFuture = startDate > new Date();

    return isStartDateInFuture;
} 
