'use server'

import pbAdmin from "@/pbaseAdmin";

// Define the Event interface
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

// Get event details by ID
export async function getEventById(eventId: string): Promise<Event | null> {
    try {
        const eventData = await pbAdmin.collection('events').getOne(eventId);
        return {
            id: eventData.id,
            start_date: eventData.start_date,
            name: eventData.name,
            description: eventData.description,
            location: eventData.location,
            end_date: eventData.end_date,
            min_team_size: eventData.min_team_size,
            max_team_size: eventData.max_team_size
        };
    } catch (error) {
        console.error("Error fetching event:", error);
        return null;
    }
}

// Check if a user is registered for a specific event
export async function isUserRegisteredForEvent(userId: string, eventId: string): Promise<boolean> {
    try {
        const records = await pbAdmin.collection('event_user').getList(1, 1, {
            filter: `event="${eventId}" && user="${userId}"`,
        });
        return records.items.length > 0;
    } catch (error) {
        console.error("Error checking event registration:", error);
        return false;
    }
}

// Determine if join notice should be shown
export async function shouldShowJoinNotice(userId: string, eventId: string): Promise<boolean> {
    try {
        // Check if user is registered
        const isRegistered = await isUserRegisteredForEvent(userId, eventId);
        if (isRegistered) {
            return false;
        }
        
        // Get event details to check start date
        const event = await getEventById(eventId);
        if (!event) {
            return false;
        }
        
        // Check if start date is valid or in the future
        const startDate = new Date(event.start_date);
        const isStartDateInFuture = startDate > new Date();
        
        return isStartDateInFuture;
    } catch (error) {
        console.error("Error determining if join notice should be shown:", error);
        return false;
    }
} 
