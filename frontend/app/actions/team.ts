"use server";

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
 * @param teamId ID of the event to get team members for
 * @returns Array of team members
 */
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const members: any[] = (await axiosInstance.get(`team/${teamId}/members`))
    .data;

  return members.map((member: any) => ({
    id: member.id,
    name: member.name,
    username: member.username,
    profilePicture: member.profilePicture,
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
  return (
    await axiosInstance.get(
      `team/event/${eventId}/searchInviteUsers/${searchQuery}`,
    )
  ).data;
}

/**
 * Send a team invite to a user
 * @returns boolean indicating success
 * @param eventId
 * @param userId ID of the user to invite
 */
export async function sendTeamInvite(
  eventId: string,
  userId: string,
): Promise<boolean> {
  return (
    await axiosInstance.post(`team/event/${eventId}/sendInvite`, {
      userToInviteId: userId,
    })
  ).data;
}

/**
 * Get pending team invites for a user
 * @returns Array of team invites with details
 * @param eventId
 */
export async function getUserPendingInvites(
  eventId: string,
): Promise<TeamInviteWithDetails[]> {
  return (await axiosInstance.get(`team/event/${eventId}/pending`)).data;
}

/**
 * Accept a team invite
 * @param eventId
 * @param teamId ID of the team that sent the invite
 * @returns Object with success status and optional message
 */
export async function acceptTeamInvite(eventId: string, teamId: string) {
  return (
    await axiosInstance.put(`team/event/${eventId}/acceptInvite/${teamId}`)
  ).data;
}

/**
 * Decline a team invite
 * @param eventId
 * @param teamId ID of the team that sent the invite
 * @returns Object with success status and optional message
 */
export async function declineTeamInvite(eventId: string, teamId: string) {
  return (
    await axiosInstance.delete(`team/event/${teamId}/declineInvite/${teamId}`)
  ).data;
}

/**
 * Get all teams for a specific event
 * @param eventId ID of the event
 * @returns Array of teams
 */
export async function getTeamsForEvent(eventId: string): Promise<Team[]> {
  const teams = (await axiosInstance.get(`team/event/${eventId}`)).data;

  return teams.map((team: any) => ({
    id: team.id,
    name: team.name,
    repo: team.repo,
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
  const teams = (
    await axiosInstance.get(`team/event/${eventId}/`, {
      params: {
        searchName: searchTeamName,
        sortBy: sortColumn,
        sortDir: sortDirection,
      },
    })
  ).data;

  return teams.map((team: any) => ({
    id: team.id,
    name: team.name,
    repo: team.repo || "",
    membersCount: team.userCount,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  }));
}
