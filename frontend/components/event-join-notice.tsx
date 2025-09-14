"use client";
import { Button, Chip } from "@heroui/react";
import { useState } from "react";
import { joinEvent } from "@/app/actions/event";

interface EventJoinNoticeProps {
  eventId: string;
  userId: string;
  startDate: string;
}

export default function EventJoinNotice({
  eventId,
  userId,
  startDate,
}: EventJoinNoticeProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = new Date(startDate) <= new Date();

  const handleJoin = async () => {
    if (!hasStarted) return;
    setIsJoining(true);
    setError(null);

    try {
      const success = await joinEvent(eventId);

      if (success) {
        window.location.reload();
      } else {
        setError("Failed to join the event. Please try again.");
      }
    } catch (err) {
      console.error("Error joining event:", err);
      setError("Failed to join the event. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="w-full bg-primary-50 border-b border-primary-200">
      <div className="container mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
        {hasStarted ? (
          <>
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
          </>
        ) : (
          <div className="w-full flex items-center justify-between">
            <p className="text-warning-400">
              This event has not started yet. You can join once it begins.
            </p>
            <Chip color="warning" variant="flat">
              Not started
            </Chip>
          </div>
        )}
      </div>
    </div>
  );
}
