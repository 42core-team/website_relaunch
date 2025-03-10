'use client'
import { Button } from "@heroui/react";
import { useState } from "react";
import { joinEvent } from "@/app/actions/event";

interface EventJoinNoticeProps {
    eventId: string;
    userId: string;
}

export default function EventJoinNotice({ eventId, userId }: EventJoinNoticeProps) {
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoin = async () => {
        setIsJoining(true);
        setError(null);
        
        try {
            const success = await joinEvent(userId, eventId);
            
            if (success) {
                window.location.reload();
            } else {
                setError('Failed to join the event. Please try again.');
            }
        } catch (err) {
            console.error('Error joining event:', err);
            setError('Failed to join the event. Please try again.');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="w-full bg-primary-50 border-b border-primary-200">
            <div className="container mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
                <p className="text-primary-700">
                    Join this event to participate with your team!
                </p>
                <div className="flex items-center gap-4">
                    {error && <span className="text-danger text-sm">{error}</span>}
                    <Button
                        color="primary"
                        isLoading={isJoining}
                        onPress={handleJoin}
                    >
                        Join Event
                    </Button>
                </div>
            </div>
        </div>
    );
} 