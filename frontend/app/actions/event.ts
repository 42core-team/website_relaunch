"use server";

import axiosInstance, { handleError } from "@/app/actions/axios";
import { isActionError, ServerActionResponse } from "@/app/actions/errors";
import { EventState } from "@/app/actions/event-model";

export interface Event {
  id: string;
  startDate: string;
  name: string;
  description?: string;
  location?: string;
  endDate: string;
  minTeamSize: number;
  maxTeamSize: number;
  currentRound: number;
  type?: string;
  treeFormat?: number;
  repoTemplateOwner?: string;
  repoTemplateName?: string;
  githubOrg: string;
  repoLockDate?: string;
  areTeamsLocked: boolean;
  state: EventState;
}

export async function getEventById(
  eventId: string,
): Promise<ServerActionResponse<Event>> {
  return await handleError(axiosInstance.get(`event/${eventId}`));
}

export async function isUserRegisteredForEvent(
  eventId: string,
): Promise<ServerActionResponse<boolean>> {
  return await handleError(
    axiosInstance.get<boolean>(`event/${eventId}/isUserRegistered`),
  );
}

export async function shouldShowJoinNotice(eventId: string): Promise<boolean> {
  const isRegistered = await isUserRegisteredForEvent(eventId);
  if (isRegistered) return false;

  const event = await getEventById(eventId);
  if (isActionError(event) || !event) return false;

  const endDate = new Date(event.endDate);
  return endDate > new Date();
}

export async function isEventAdmin(
  eventId: string,
): Promise<ServerActionResponse<boolean>> {
  return await handleError(axiosInstance.get(`event/${eventId}/isEventAdmin`));
}

// Get all events
export async function getEvents(): Promise<Event[]> {
  return (await axiosInstance.get("event")).data as Event[];
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
  await axiosInstance.put(`event/${eventId}/join`);
  return true;
}

// Interface for creating events
interface EventCreateParams {
  name: string;
  description?: string;
  githubOrg: string;
  githubOrgSecret: string;
  location?: string;
  startDate: number;
  endDate: number;
  minTeamSize: number;
  maxTeamSize: number;
  treeFormat?: number;
  repoTemplateOwner: string;
  repoTemplateName: string;
}

// Create a new event
export async function createEvent(
  eventData: EventCreateParams,
): Promise<ServerActionResponse<Event>> {
  return await handleError(axiosInstance.post<Event>(`event`, eventData));
}

export async function canUserCreateEvent(): Promise<boolean> {
  return (await axiosInstance.get<boolean>("user/canCreateEvent")).data;
}

export async function setEventTeamsLockDate(
  eventId: string,
  lockDate: string | null,
): Promise<ServerActionResponse<Event>> {
  return await handleError(
    axiosInstance.put<Event>(`event/${eventId}/lockTeamsDate`, {
      repoLockDate: lockDate,
    }),
  );
}
