"use server";

import {
  getMaxSwissRounds,
  calculateNextGroupPhaseMatches,
  createSingleEliminationBracket,
} from "@/app/actions/event";
import {
  Event,
  events_state_enum,
  Match,
  matches_phase_enum,
  matches_state_enum,
} from "@/generated/prisma";
import { prisma } from "@/initializer/database";
import { Team } from "./team";

async function handleTeamFindingState(eventId: string): Promise<boolean> {
  await prisma.event.update({
    where: { id: eventId },
    data: { state: events_state_enum.CODING_PHASE },
  });
  console.log("TEAM_FINDING -> CODING_PHASE");
  return true;
}

async function handleCodingPhaseState(eventId: string): Promise<boolean> {
  await prisma.event.update({
    where: { id: eventId },
    data: { state: events_state_enum.SWISS_ROUND, currentRound: 0 },
  });
  console.log("CODING_PHASE -> SWISS_ROUND");
  return true;
}

async function handleSwissRoundState(
  eventId: string,
  event: Event,
  teams: Team[],
  currentSwissRoundFinished: Match[],
  maxRounds: number,
): Promise<boolean> {
  if (event.currentRound === 0) {
    await calculateNextGroupPhaseMatches(eventId);
    await prisma.event.update({
      where: { id: eventId },
      data: { currentRound: 1 },
    });
    console.log("SWISS_ROUND -> SWISS_ROUND (Created first round matches)");
    return true;
  }

  if (
    !(
      currentSwissRoundFinished.length * 2 === teams.length ||
      currentSwissRoundFinished.length * 2 + 1 === teams.length
    )
  ) {
    console.log("Not all matches finished in swiss round");
    return false;
  }
  await addPointsToTeams(eventId);

  if (event.currentRound >= maxRounds) {
    await prisma.event.update({
      where: { id: eventId },
      data: { state: events_state_enum.ELIMINATION_ROUND, currentRound: 0 },
    });
    console.log("SWISS_ROUND -> ELIMINATION_ROUND");
    return true;
  } else {
    await calculateNextGroupPhaseMatches(eventId);
    await prisma.event.update({
      where: { id: eventId },
      data: { currentRound: event.currentRound + 1 },
    });
    console.log("SWISS_ROUND -> SWISS_ROUND (Advanced to next round)");
    return true;
  }
}

async function handleEliminationRoundState(
  eventId: string,
  event: Event,
  currentEliminationRoundFinished: Match[],
): Promise<boolean> {
  const eventInfo = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!eventInfo) return false;

  if (event.currentRound === 0) {
    console.log("Creating initial bracket");
    await calcMedianBuchholzPoints(eventId);
    const qualifiedTeams = await getQualifiedTeams(eventId);
    console.log(qualifiedTeams);
    return true;
  } else if (
    currentEliminationRoundFinished.length ===
    eventInfo.treeFormat / Math.pow(2, event.currentRound)
  ) {
    await prisma.event.update({
      where: { id: eventId },
      data: { currentRound: event.currentRound + 1 },
    });
    console.log("ELIMINATION_ROUND -> ELIMINATION_ROUND");
    return true;
  }

  console.log("ELIMINATION_ROUND -> ELIMINATION_ROUND");
  return false;
}

export async function increaseRound(eventId: string): Promise<boolean> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  const teams = await prisma.team.findMany({
    where: { eventId },
  });

  if (!event) return false;

  const maxRounds = await getMaxSwissRounds(teams.length);

  const currentSwissRoundFinished = await prisma.match.findMany({
    where: {
      phase: matches_phase_enum.SWISS,
      round: event.currentRound,
      state: matches_state_enum.FINISHED,
      matchTeams: {
        some: {
          team: {
            eventId,
          },
        },
      },
    },
  });

  const currentEliminationRoundFinished = await prisma.match.findMany({
    where: {
      phase: matches_phase_enum.ELIMINATION,
      round: event.currentRound,
      state: matches_state_enum.FINISHED,
    },
  });

  if (event.state === events_state_enum.SWISS_ROUND) {
    return await handleSwissRoundState(
      eventId,
      event,
      teams,
      currentSwissRoundFinished,
      maxRounds,
    );
  } else if (event.state === events_state_enum.ELIMINATION_ROUND) {
    return await handleEliminationRoundState(
      eventId,
      event,
      currentEliminationRoundFinished,
    );
  } else if (event.state === events_state_enum.TEAM_FINDING) {
    return await handleTeamFindingState(eventId);
  } else if (event.state === events_state_enum.CODING_PHASE) {
    return await handleCodingPhaseState(eventId);
  } else if (event.state === events_state_enum.FINISHED) {
    console.log("FINISHED");
    return false;
  } else {
    console.log("Unknown state: " + event.state);
    return false;
  }
}

export async function addPointsToTeams(eventId: string): Promise<boolean> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) return false;

  const finishedMatches = await prisma.match.findMany({
    where: {
      phase: matches_phase_enum.SWISS,
      round: event.currentRound,
      state: matches_state_enum.FINISHED,
    },
    include: { winner: true },
  });

  for (const match of finishedMatches) {
    if (match.winner) {
      await prisma.team.update({
        where: { id: match.winner.id },
        data: { score: { increment: 10 } },
      });
    }
  }

  return true;
}

export async function getQualifiedTeams(eventId: string): Promise<Team[]> {
  const teams = await prisma.team.findMany({
    where: { eventId },
  });

  teams.sort((a, b) => {
    const scoreDiff =
      b.score + Number(b.hadBye) * 10 - (a.score + Number(a.hadBye) * 10);
    if (scoreDiff !== 0) return scoreDiff;
    return a.id.localeCompare(b.id);
  });

  return teams.slice(0, 16);
}

export async function calcMedianBuchholzPoints(
  eventId: string,
): Promise<boolean> {
  const teams = await prisma.team.findMany({
    where: { eventId },
    include: {
      matchTeams: {
        include: {
          match: {
            include: { matchTeams: { include: { team: true } }, winner: true },
          },
        },
      },
    },
  });

  for (const team of teams) {
    const swissMatches = team.matchTeams
      .map((mt) => mt.match)
      .filter(
        (match) =>
          match.phase === matches_phase_enum.SWISS &&
          match.state === matches_state_enum.FINISHED,
      );

    const opponentScores: number[] = [];

    for (const match of swissMatches) {
      const opponent = match.matchTeams.find(
        (mt) => mt.team.id !== team.id,
      )?.team;

      if (opponent) {
        opponentScores.push(opponent.score);
      }
    }

    if (team.hadBye) {
      opponentScores.push(0);
    }

    let buchholzPoints = 0;

    if (opponentScores.length > 0) {
      opponentScores.sort((a, b) => a - b);

      if (opponentScores.length >= 3) {
        opponentScores.shift();
        opponentScores.pop();
      }

      buchholzPoints = opponentScores.reduce((sum, score) => sum + score, 0);
    }

    await prisma.team.update({
      where: { id: team.id },
      data: { buchholzPoints },
    });
  }
  return true;
}

export async function getCurrentPhase(
  eventId: string,
): Promise<events_state_enum | null> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  return event?.state || null;
}

export async function getCurrentRound(eventId: string): Promise<number | null> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  return event?.currentRound || null;
}

// Functions:
// General:
// - Increase round!!!!!!!!!
// -- subfunctions for: increase swiss round, increase elimination round, change phases,
// - Get current round
// - Get max rounds
//
//
// Swiss:
//
// Bracket:
// Consistent function for initial team bracket assignment
//

// Client side:
// Swiss:
// - Always Render Labels (Round number)
//
// Bracket:
// - Render Tree function (variable based on single / double elimination)
// - Display progression based on winners of initial state
