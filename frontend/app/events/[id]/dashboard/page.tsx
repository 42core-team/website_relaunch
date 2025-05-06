"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import {
    getEventById,
    getTeamsCountForEvent,
    getParticipantsCountForEvent,
    isEventAdmin
} from "@/app/actions/event";
import {
    increaseRound,
    getCurrentPhase,
    getCurrentRound
} from "@/app/actions/tournament";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {lockEvent} from "@/app/actions/team";
import { events_state_enum } from "@/generated/prisma";

export default function DashboardPage() {
    const { id } = useParams();
    const eventId = id as string;
    const session = useSession();
    const userId = session.data?.user?.id || "";

    const [event, setEvent] = useState<any>(null);
    const [teamsCount, setTeamsCount] = useState<number>(0);
    const [participantsCount, setParticipantsCount] = useState<number>(0);
    const [currentPhase, setCurrentPhase] = useState<events_state_enum | null>(null);
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
                const phase = await getCurrentPhase(eventId);
                const round = await getCurrentRound(eventId);
                const adminCheck = await isEventAdmin(userId , eventId);

                setEvent(eventData);
                setTeamsCount(teams);
                setParticipantsCount(participants);
                setCurrentPhase(phase);
                setCurrentRound(round);
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
            await increaseRound(eventId);
            // Refresh data
            const phase = await getCurrentPhase(eventId);
            const round = await getCurrentRound(eventId);
            setCurrentPhase(phase);
            setCurrentRound(round);
        } catch (error) {
            console.error("Error increasing round:", error);
        }
        setActionLoading(false);
    };

    const phaseDisplay = (phase: events_state_enum | null) => {
        if (!phase) return "Unknown";

        switch (phase) {
            case events_state_enum.TEAM_FINDING: return "Team Finding";
            case events_state_enum.CODING_PHASE: return "Coding Phase";
            case events_state_enum.SWISS_ROUND: return "Swiss Round";
            case events_state_enum.ELIMINATION_ROUND: return "Elimination Round";
            case events_state_enum.FINISHED: return "Finished";
            default: return phase;
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-[50vh] text-white">Loading dashboard...</div>;
    }

    return (
        <div className="flex flex-col gap-6 bg-gray-900 min-h-screen p-6">
            <h1 className="text-3xl font-bold text-white">Event Dashboard</h1>

            {/* Event Overview */}
            <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-white">Event Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-400">Name</p>
                        <p className="font-medium text-white">{event?.name || "Unknown"}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Date</p>
                        <p className="font-medium text-white">
                            {event?.start_date ? new Date(event.start_date).toLocaleDateString() : "Unknown"} -
                            {event?.end_date ? new Date(event.end_date).toLocaleDateString() : "Unknown"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tournament Status */}
            <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-white">Tournament Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-400">Current Phase</p>
                        <div className="font-medium">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                currentPhase === events_state_enum.FINISHED ? 'bg-green-900 text-green-300' :
                                    currentPhase === events_state_enum.ELIMINATION_ROUND ? 'bg-purple-900 text-purple-300' :
                                        currentPhase === events_state_enum.SWISS_ROUND ? 'bg-blue-900 text-blue-300' :
                                            currentPhase === events_state_enum.CODING_PHASE ? 'bg-yellow-900 text-yellow-300' :
                                                'bg-gray-700 text-gray-300'
                            }`}>
                                {phaseDisplay(currentPhase)}
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-400">Current Round</p>
                        <p className="font-medium text-white">{currentRound !== null ? currentRound : "N/A"}</p>
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
                    <h2 className="text-xl font-semibold mb-4 text-white">Admin Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onPress={handleIncreaseRound}
                            disabled={actionLoading || currentPhase === events_state_enum.FINISHED}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {actionLoading ? "Processing..." : "Advance Tournament"}
                        </Button>
                        <Button
                            onPress={() => {
                                lockEvent(eventId).then(() => {
                                    alert("locked team repositories");
                                }).catch(() => {
                                    alert("error occurred");
                                })
                            }}
                            disabled={actionLoading}
                            className="bg-gray-700 hover:bg-gray-600 text-white"
                        >
                            Lock Team Repositories
                        </Button>
                    </div>
                    <p className="text-sm text-gray-400 mt-4">
                        Note: Advancing the tournament will move to the next round or phase depending on the current state.
                    </p>
                </div>
            )}
        </div>
    );
}