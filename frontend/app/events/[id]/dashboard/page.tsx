"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import {
  getEventById,
  getTeamsCountForEvent,
  getParticipantsCountForEvent,
  isEventAdmin,
} from "@/app/actions/event";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { lockEvent } from "@/app/actions/team";
import { isActionError } from "@/app/actions/errors";

export default function DashboardPage() {
  const { id } = useParams();
  const eventId = id as string;
  const session = useSession();
  const userId = session.data?.user?.id || "";

  const [event, setEvent] = useState<any>(null);
  const [teamsCount, setTeamsCount] = useState<number>(0);
  const [participantsCount, setParticipantsCount] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await getEventById(eventId);
        const teams = await getTeamsCountForEvent(eventId);
        const participants = await getParticipantsCountForEvent(eventId);

        const adminCheck = await isEventAdmin(eventId);

        if (isActionError(adminCheck)) {
          setIsAdmin(false);
          return;
        }

        setEvent(eventData);
        setTeamsCount(teams);
        setParticipantsCount(participants);

        setIsAdmin(adminCheck);
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, session.data?.user.id]);

  const handleIncreaseRound = async () => {
    setActionLoading(true);
    try {
    } catch (error) {
      console.error("Error increasing round:", error);
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 bg-gray-900 min-h-lvh p-6">
      <h1 className="text-3xl font-bold text-white">Event Dashboard</h1>

      {/* Event Overview */}
      <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Event Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Name</p>
            <p className="font-medium text-white">{event?.name || "Unknown"}</p>
          </div>
          <div>
            <p className="text-gray-400">Date</p>
            <p className="font-medium text-white">
              {event?.start_date
                ? new Date(event.start_date).toLocaleDateString()
                : "Unknown"}{" "}
              -
              {event?.end_date
                ? new Date(event.end_date).toLocaleDateString()
                : "Unknown"}
            </p>
          </div>
        </div>
      </div>

      {/* Tournament Status */}
      <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Tournament Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Current Phase</p>
            <div className="font-medium"></div>
          </div>
          <div>
            <p className="text-gray-400">Current Round</p>
            <p className="font-medium text-white">
              {currentRound !== null ? currentRound : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Team Statistics */}
      <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Participation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Teams</p>
            <p className="font-medium text-white">{teamsCount}</p>
          </div>
          <div>
            <p className="text-gray-400">Participants</p>
            <p className="font-medium text-white">{participantsCount}</p>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Admin Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button
              onPress={() => {
                lockEvent(eventId)
                  .then(() => {
                    alert("locked team repositories");
                  })
                  .catch(() => {
                    alert("error occurred");
                  });
              }}
              disabled={actionLoading}
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              Lock Team Repositories
            </Button>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Note: Advancing the tournament will move to the next round or phase
            depending on the current state.
          </p>
        </div>
      )}
    </div>
  );
}
