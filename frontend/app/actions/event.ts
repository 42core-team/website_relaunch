"use server";

import axiosInstance from "@/app/actions/axios";

export interface Event {
  id: string;
  start_date: number;
  name: string;
  description?: string;
  location?: string;
  end_date: number;
  min_team_size: number;
  max_team_size: number;
  currentRound: number;
  event_type?: string;
  tree_format?: number;
  repo_template_owner?: string;
  repo_template_name?: string;
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
    start_date: event.startDate,
    end_date: event.endDate,
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
): Promise<Event | { error: string }> {
  return (await axiosInstance.post(`event`, eventData)).data;
}

export async function canUserCreateEvent(): Promise<boolean> {
  return (await axiosInstance.get<boolean>("user/canCreateEvent")).data;
}
