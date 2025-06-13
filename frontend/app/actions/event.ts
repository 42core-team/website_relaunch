"use server";

import { SingleElimination, Swiss } from "tournament-pairings";
import { authOptions } from "@/app/utils/authOptions";
import { prisma } from "@/initializer/database";
import {
  events_state_enum,
  events_type_enum,
  Match,
  matches_phase_enum,
  matches_state_enum,
  Team,
  user_event_permissions_role_enum,
} from "@/generated/prisma";
// @ts-ignore
import { Player } from "tournament-pairings/interfaces";
import { getServerSession } from "next-auth/next";
import axiosInstance from "@/app/actions/axios";

export interface Event {
  id: string;
  start_date: string;
  name: string;
  description?: string;
  location?: string;
  end_date: string;
  min_team_size: number;
  max_team_size: number;
  currentRound: number;
  event_type?: string;
  tree_format?: number;
  repo_template_owner?: string;
  repo_template_name?: string;
}

export async function getTeamsToAvoid(teamId: string): Promise<string[]> {
  const pastMatches = await prisma.match.findMany({
    where: {
      matchTeams: {
        some: {
          teamsId: teamId,
        },
      },
    },
    include: {
      matchTeams: true,
    },
  });

  const pastOpponents = pastMatches
    .map((p) => p.matchTeams?.map((t) => t.teamsId))
    .flat();
  return pastOpponents.filter((id) => id !== teamId);
}

export async function getMaxSwissRounds(teams: number): Promise<number> {
  return Math.ceil(Math.log2(teams));
}

// To be deprecated
export async function createSingleEliminationBracket(
  eventId: string,
): Promise<boolean> {
  const event = await prisma.event.findFirst({
    where: { id: eventId },
    include: {
      teams: true,
    },
  });

  if (!event) return false;

  // Check if elimination bracket already exists
  const existingMatches = await prisma.match.findMany({
    where: {
      phase: matches_phase_enum.ELIMINATION,
      matchTeams: {
        some: {
          team: {
            eventId: eventId,
          },
        },
      },
    },
    include: {
      matchTeams: true,
      winner: true,
    },
  });

  // CASE 1: No elimination matches yet - create initial bracket
  if (existingMatches.length === 0) {
    // Verify Swiss rounds are complete
    const maxSwissRounds = await getMaxSwissRounds(event.teams.length);
    if (event.currentRound < maxSwissRounds) {
      console.log("Swiss rounds not complete yet");
      return false;
    }

    // Get teams ordered by score for seeding
    const teams = await prisma.team.findMany({
      where: { eventId: eventId },
      orderBy: { score: "desc" },
      take: 16,
    });

    if (teams.length < 2) return false;

    // Create player objects for tournament-pairings
    const players: Player[] = teams.map((team) => ({
      id: team.id,
      name: team.name,
      score: team.score,
      receivedBye: team.hadBye,
    }));

    // Generate single elimination bracket
    const matches = SingleElimination(players);

    // Create match entities
    const matchEntities: Match[] = [];

    matches.forEach((match, index) => {
      const roundNumber =
        Math.ceil(Math.log2(matches.length + 1)) -
        Math.floor(Math.log2(index + 1));

      const newMatch: Match = {
        id: "", // Provide appropriate default or generated ID
        state: matches_state_enum.PLANNED,
        round: 0, // Replace with the correct round number
        phase: matches_phase_enum.ELIMINATION,
        createdAt: new Date(),
        updatedAt: new Date(),
        winnerId: null, // Adjust based on your logic
      };

      const teams: Team[] = [];

      // Add teams if they're not byes
      if (match.player1) {
        const team1 = teams.find((t) => t.id === match.player1);
        if (team1) teams.push(team1);
      }

      if (match.player2) {
        const team2 = teams.find((t) => t.id === match.player2);
        if (team2) teams.push(team2);
      }

      // If a match has only one team, it's a bye - set winner immediately
      if (teams.length === 1) {
        newMatch.winnerId = teams[0].id;
        newMatch.state = matches_state_enum.FINISHED;
      }

      matchEntities.push(newMatch);
    });

    // Save match entities
    await prisma.match.createMany({
      data: matchEntities,
    });

    // Update event state
    await prisma.event.update({
      where: { id: eventId },
      data: {
        state: events_state_enum.ELIMINATION_ROUND,
        currentRound: 1,
      },
    });

    return true;
  }

  // CASE 2: Elimination matches exist - advance winners

  // Find current round
  const currentRound = Math.max(...existingMatches.map((m) => m.round));

  // Get finished matches from current round that have winners
  const finishedMatches = existingMatches.filter(
    (match) =>
      match.round === currentRound &&
      match.state === matches_state_enum.FINISHED &&
      match.winner,
  );

  // Get next round matches
  const nextRoundMatches = existingMatches.filter(
    (match) =>
      match.round === currentRound - 1 &&
      match.state === matches_state_enum.PLANNED,
  );

  // If no next round matches, tournament is complete
  if (nextRoundMatches.length === 0) {
    // Check if we have a final winner
    const finalMatch = existingMatches.find((m) => m.round === 1);

    if (finalMatch?.winner) {
      // Tournament is complete, update event state
      await prisma.event.update({
        where: { id: eventId },
        data: { state: matches_state_enum.FINISHED },
      });
    }

    return true;
  }

  // Update next round matches with winners
  for (const nextMatch of nextRoundMatches) {
    // Find which matches feed into this one (2 matches per next match)
    const feedingMatches = finishedMatches.filter((m) => {
      // Calculate index ranges to determine which matches feed into which
      const matchesPerRound = Math.pow(2, currentRound - 1);
      const matchesInNextRound = matchesPerRound / 2;
      const matchesPerNextMatch = matchesPerRound / matchesInNextRound;

      // Calculate the index range for the current next match
      const nextMatchIndex = nextRoundMatches.indexOf(nextMatch);
      const startIdx = nextMatchIndex * matchesPerNextMatch;
      const endIdx = startIdx + matchesPerNextMatch;

      // Find the current match's index in its round
      const currentMatchIndex = finishedMatches.indexOf(m);

      return currentMatchIndex >= startIdx && currentMatchIndex < endIdx;
    });

    // Get winners from feeding matches
    const winners = feedingMatches.map((m) => m.winner).filter(Boolean);

    // Add winners to next match
    nextMatch.matchTeams = winners
      .filter((winner) => winner?.id !== undefined)
      .map((winner) => ({
        matchesId: nextMatch.id,
        teamsId: winner!.id,
      }));

    // If we have two teams, match is ready to play
    if (winners.length === 2) {
      nextMatch.state = matches_state_enum.READY;
    }
    // If we have only one winner and no other matches feed in, they win by default
    else if (winners.length === 1) {
      nextMatch.winner = winners[0];
      nextMatch.state = matches_state_enum.FINISHED;
    }
  }

  // Save updated matches
  await prisma.match.updateMany({
    data: nextRoundMatches,
  });

  // Update event's current round
  await prisma.event.update({
    where: { id: eventId },
    data: { currentRound: event.currentRound + 1 },
  });

  return true;
}

export async function calculateNextGroupPhaseMatches(
  eventId: string,
): Promise<boolean> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { teams: true },
  });
  if (!event) return false;

  const teams = event.teams;
  const maxRounds = await getMaxSwissRounds(teams.length);
  if (event.currentRound >= maxRounds) return false;

  const nextRound = event.currentRound + 1;
  const matchableTeams: Player[] = await Promise.all(
    teams.map(async (team) => {
      const teamsToAvoid = await getTeamsToAvoid(team.id);
      return {
        id: team.id,
        score: team.score,
        avoid: teamsToAvoid,
        receivedBye: team.hadBye,
      };
    }),
  );

  const matches = Swiss(matchableTeams, nextRound, true);
  const newMatches = matches.map((match) => {
    return {
      state: matches_state_enum.PLANNED,
      round: nextRound,
      phase: matches_phase_enum.SWISS,
      matchTeams: [
        match.player1 ? { teamsId: match.player1 } : null,
        match.player2 ? { teamsId: match.player2 } : null,
      ].filter(Boolean),
    };
  });

  await prisma.match.createMany({
    data: newMatches,
  });

  await prisma.event.update({
    where: { id: eventId },
    data: { currentRound: nextRound },
  });

  return true;
}

export async function getEventById(eventId: string): Promise<Event | null> {
  const event = (await axiosInstance.get(`event/${eventId}`)).data;

  if (!event) return null;

  return {
    id: event.id,
    name: event.name,
    description: event.description,
    location: event.location,
    start_date: event.startDate,
    end_date: event.endDate,
    min_team_size: event.minTeamSize,
    max_team_size: event.maxTeamSize,
    currentRound: event.currentRound,
    event_type: event.type,
    tree_format: event.treeFormat,
    repo_template_owner: event.repoTemplateOwner,
    repo_template_name: event.repoTemplateName,
  };
}

export async function isUserRegisteredForEvent(
  eventId: string,
): Promise<boolean> {
  return (await axiosInstance.get(`event/${eventId}/isUserRegistered`)).data;
}

export async function shouldShowJoinNotice(eventId: string): Promise<boolean> {
  const isRegistered = await isUserRegisteredForEvent(eventId);
  if (isRegistered) return false;

  const event = await getEventById(eventId);
  if (!event) return false;

  const endDate = new Date(event.end_date);
  return endDate > new Date();
}

export async function isEventAdmin(eventId: string): Promise<boolean> {
  return (await axiosInstance.get(`event/${eventId}/isEventAdmin`)).data;
}

// Get all events
export async function getEvents(): Promise<Event[]> {
  const events = (await axiosInstance.get("event")).data;

  return events.map((event: any) => ({
    id: event.id,
    name: event.name,
    description: event.description,
    location: event.location,
    start_date: event.startDate.toISOString(),
    end_date: event.endDate.toISOString(),
    min_team_size: event.minTeamSize,
    max_team_size: event.maxTeamSize,
    currentRound: event.currentRound,
    event_type: event.type,
    tree_format: event.treeFormat,
    repo_template_owner: event.repoTemplateOwner,
    repo_template_name: event.repoTemplateName,
  }));
}

export async function getTeamsCountForEvent(eventId: string): Promise<number> {
  return (await axiosInstance.get(`event/${eventId}/teamsCount`)).data;
}

// Get total participants count for an event
export async function getParticipantsCountForEvent(
  eventId: string,
): Promise<number> {
  return (await axiosInstance.get(`event/${eventId}/participantsCount`)).data;
}

// Join a user to an event
export async function joinEvent(eventId: string): Promise<boolean> {
  return (await axiosInstance.put(`event/${eventId}/join`)).data;
}

// Interface for creating events
interface EventCreateParams {
  name: string;
  description?: string;
  location?: string;
  startDate: number;
  endDate: number;
  minTeamSize: number;
  maxTeamSize: number;
  treeFormat?: number;
  type: string;
  repoTemplateOwner: string;
  repoTemplateName: string;
}

// Create a new event
export async function createEvent(
  eventData: EventCreateParams,
): Promise<Event | { error: string }> {
  return await axiosInstance.post(`event`, eventData);
}

export async function canUserCreateEvent(): Promise<boolean> {
  try {
    // Get current user from session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return false;
    }

    // Check if user has permission to create events
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    return user?.canCreateEvent || false;
  } catch (error) {
    console.error("Error checking event creation permission:", error);
    return false;
  }
}
