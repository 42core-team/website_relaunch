"use server";

import { prisma } from "@/initializer/database";
import {
  Team as PrismaTeam,
  User as PrismaUser,
  Event as PrismaEvent,
  events_type_enum,
} from "@/generated/prisma";
import {
  repositoryApi,
  userApi,
  rushRepositoryApi,
  rushUserApi,
} from "@/initializer/github";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";
import { isEventAdmin } from "@/app/actions/event";
import axiosInstance from "@/app/actions/axios";

export interface Team {
  id: string;
  name: string;
  repo: string;
  locked?: boolean;
  created?: string;
  updated?: string;
  createdAt?: Date;
  updatedAt?: Date;
  membersCount?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  username: string;
  profilePicture?: string;
}

export interface UserSearchResult {
  id: string;
  name: string;
  username: string;
  profilePicture?: string;
  isInvited: boolean;
}

export interface TeamInviteWithDetails {
  id: string;
  teamId: string;
  teamName: string;
  createdAt: Date;
}

export async function getTeamById(teamId: string): Promise<Team | null> {
  const team = (await axiosInstance.get(`team/${teamId}`)).data;

  return team
    ? {
        id: team.id,
        name: team.name,
        repo: team.repo || "",
        locked: team.locked,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      }
    : null;
}

export async function getMyEventTeam(eventId: string): Promise<Team | null> {
  const team = (await axiosInstance.get(`team/event/${eventId}/my`)).data;

  if (!team) return null;

  return {
    id: team.id,
    name: team.name,
    repo: team.repo || "",
    locked: team.locked,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  };
}

export async function lockEvent(eventId: string) {
  return (await axiosInstance.put(`event/${eventId}/lock`)).data;
}

export async function createTeam(
  name: string,
  eventId: string,
): Promise<Team | { error: string }> {
  const newTeam = (
    await axiosInstance.post(`team/event/${eventId}/create`, {
      name,
    })
  ).data;

  return {
    id: newTeam.id,
    name: newTeam.name,
    repo: newTeam.repo,
    createdAt: newTeam.createdAt,
    updatedAt: newTeam.updatedAt,
  };
}

/**
 * Leave a team and delete it if this was the last member
 * @param eventId ID of the event to leave the team for
 * @returns boolean indicating success
 */
export async function leaveTeam(eventId: string): Promise<boolean> {
  return (await axiosInstance.put(`team/event/${eventId}/leave`)).data;
}

/**
 * Get all members of a team
 * @param eventId ID of the event to get team members for
 * @returns Array of team members
 */
export async function getTeamMembers(eventId: string): Promise<TeamMember[]> {
  const members: any[] = (
    await axiosInstance.get(`team/event/${eventId}/members`)
  ).data;

  return members.map((member: any) => ({
    id: member.user.id,
    name: member.user.name,
    username: member.user.username,
    profilePicture: member.user.profilePicture,
  }));
}

/**
 * Search for users that can be invited to a team
 * @param eventId ID of the event
 * @param searchQuery query string to search by username or name
 * @returns Array of user search results
 */
export async function searchUsersForInvite(
  eventId: string,
  searchQuery: string,
): Promise<UserSearchResult[]> {
  return await axiosInstance.get(
    `team/event/${eventId}/searchInviteUsers/${searchQuery}`,
  );
}

/**
 * Send a team invite to a user
 * @returns boolean indicating success
 * @param eventId
 */
export async function sendTeamInvite(eventId: string): Promise<boolean> {
  return (await axiosInstance.post(`team/event/${eventId}/sendInvite`)).data;
}

/**
 * Get pending team invites for a user
 * @param userId ID of the user
 * @returns Array of team invites with details
 */
export async function getUserPendingInvites(
  userId: string,
): Promise<TeamInviteWithDetails[]> {
  return (await axiosInstance.get(`team/event/${userId}/pending`)).data;
}

/**
 * Accept a team invite
 * @param teamId ID of the team that sent the invite
 * @param userId ID of the user accepting the invite
 * @returns Object with success status and optional message
 */
export async function acceptTeamInvite(teamId: string): Promise<{
  success: boolean;
  message?: string;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "User not authenticated" };
  }
  const userId = session.user.id;

  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        invites: true,
        event: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberOfTeams: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!team || !user) {
      return { success: false, message: "Team or user not found" };
    }

    if (team.locked) {
      return {
        success: false,
        message: "This team is locked and not accepting new members",
      };
    }

    if (user.memberOfTeams.some((t) => t.team.eventId === team.event.id)) {
      return {
        success: false,
        message: "You are already in a team for this event",
      };
    }

    if (team.repo) {
      // Determine if it's a rush event and select appropriate API and org
      const isRushEvent = team.event.type === events_type_enum.RUSH;
      const repoApi = isRushEvent ? rushRepositoryApi : repositoryApi;
      const uApi = isRushEvent ? rushUserApi : userApi;
      const orgName = isRushEvent
        ? process.env.NEXT_PUBLIC_RUSH_ORG
        : process.env.NEXT_PUBLIC_GITHUB_ORG;

      await repoApi.addCollaborator(
        orgName || "",
        team.repo,
        user.username,
        "push",
      );
      await uApi.acceptRepositoryInvitationByRepo(
        orgName || "",
        team.repo,
        user.githubAccessToken,
      );
    }

    await prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          create: {
            usersId: userId,
          },
        },
        invites: {
          deleteMany: {
            usersId: userId,
          },
        },
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Error accepting team invite:", err);
    return {
      success: false,
      message: "An error occurred while accepting the invite",
    };
  }
}

/**
 * Decline a team invite
 * @param teamId ID of the team that sent the invite
 * @param userId ID of the user declining the invite
 * @returns Object with success status and optional message
 */
export async function declineTeamInvite(teamId: string): Promise<{
  success: boolean;
  message?: string;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "User not authenticated" };
  }
  const userId = session.user.id;

  try {
    await prisma.team.update({
      where: { id: teamId },
      data: {
        invites: {
          deleteMany: {
            usersId: userId,
          },
        },
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Error declining team invite:", err);
    return {
      success: false,
      message: "An error occurred while declining the invite",
    };
  }
}

/**
 * Get all teams for a specific event
 * @param eventId ID of the event
 * @returns Array of teams
 */
export async function getTeamsForEvent(eventId: string): Promise<Team[]> {
  const teams = await prisma.team.findMany({
    where: { eventId },
    include: { members: true },
  });

  return teams.map((team) => ({
    id: team.id,
    name: team.name,
    repo: team.repo || "",
    membersCount: team.members.length,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  }));
}

export async function getTeamsForEventTable(
  eventId: string,
  searchTeamName: string | undefined = undefined,
  sortColumn: "name" | "createdAt" | "membersCount" | undefined = "name",
  sortDirection: "asc" | "desc" = "asc",
) {
  let whereName: any;
  if (searchTeamName === undefined) {
    whereName = undefined;
  } else {
    whereName = {
      contains: searchTeamName,
      mode: "insensitive",
    };
  }
  let orderBy: any;
  if (sortColumn === undefined) {
    orderBy = undefined;
  } else if (sortColumn === "membersCount") {
    orderBy = {
      members: {
        _count: sortDirection,
      },
    };
  } else {
    orderBy = {
      [sortColumn]: sortDirection,
    };
  }

  const teams = await prisma.team.findMany({
    where: {
      eventId,
      name: whereName,
    },
    orderBy,
    include: {
      members: true,
    },
  });

  return teams.map((team) => ({
    id: team.id,
    name: team.name,
    repo: team.repo || "",
    membersCount: team.members.length,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  }));
}
