'use server'

import { ensureDbConnected } from "@/initializer/database";
import { TeamEntity } from "@/entities/team.entity";
import { UserEntity } from "@/entities/users.entity";
import { EventEntity } from "@/entities/event.entity";
import { repositoryApi, userApi } from "@/initializer/github";

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
    const dataSource = await ensureDbConnected();
    const teamRepository = dataSource.getRepository(TeamEntity);
    const team = await teamRepository.findOne({ where: { id: teamId } });
    return team ? {
        id: team.id,
        name: team.name,
        repo: team.repo || '',
        locked: team.locked,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt
    } : null;
}

export async function getTeam(userId: string, eventId: string): Promise<Team | null> {
  try {
    const dataSource = await ensureDbConnected();
    const teamRepository = dataSource.getRepository(TeamEntity);
    
    const team = await teamRepository
        .createQueryBuilder('team')
        .innerJoin('team.users', 'user')
        .innerJoin('team.event', 'event')
        .where('user.id = :userId', { userId })
        .andWhere('event.id = :eventId', { eventId })
        .getOne();
    
    if (!team) return null;
    
    return {
      id: team.id,
      name: team.name,
      repo: team.repo || '',
      locked: team.locked,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt
    };
  } catch (err) {
    console.error('Error getting team:', err);
    return null;
  }
}

export async function createTeam(name: string, eventId: string, userId: string): Promise<Team | { error: string }> {
    const existingTeam = await getTeam(userId, eventId);
    if (existingTeam)
        return existingTeam;
    
    const dataSource = await ensureDbConnected();
    const teamRepository = dataSource.getRepository(TeamEntity);
    const userRepository = dataSource.getRepository(UserEntity);
    const eventRepository = dataSource.getRepository(EventEntity);
    
    // Get user and event entities
    const user = await userRepository.findOne({ where: { id: userId } });
    const event = await eventRepository.findOne({ where: { id: eventId } });
    
    if (!user || !event) {
        throw new Error("User or event not found");
    }
    
    // Check if a team with the same name (case insensitive) exists for this event
    const teamsInEvent = await teamRepository
        .createQueryBuilder('team')
        .innerJoin('team.event', 'event')
        .where('event.id = :eventId', { eventId })
        .getMany();
    
    const teamNameExists = teamsInEvent.some(
        team => team.name.toLowerCase() === name.toLowerCase()
    );
    
    if (teamNameExists) {
        return { error: `A team with the name "${name}" already exists for this event.` };
    }
    
    // Create new team
    const newTeam = teamRepository.create({
        name,
        event,
        users: [user]
    });
    
    const savedTeam = await teamRepository.save(newTeam);
    
    // Use event's template if available, otherwise use default template
    const templateOwner = event.repoTemplateOwner || "42core-team";
    const templateRepo = event.repoTemplateName || "rush02-development";

    try {
        const repo = await repositoryApi.createRepoFromTemplate(templateOwner, templateRepo, {
            owner: process.env.NEXT_PUBLIC_GITHUB_ORG || "",
            name: event.name + "-" + savedTeam.name + "-" + savedTeam.id,
            private: true,
        });

        savedTeam.repo = repo.name;
        await teamRepository.save(savedTeam);
        await repositoryApi.addCollaborator(process.env.NEXT_PUBLIC_GITHUB_ORG || "", repo.name, user.username, "pull");
        await userApi.acceptRepositoryInvitationByRepo(process.env.NEXT_PUBLIC_GITHUB_ORG || "", repo.name, user.githubAccessToken);
    } catch (error) {
        console.error("Error creating repository from template:", error);
    }

    return {
        id: savedTeam.id,
        name: savedTeam.name,
        repo: savedTeam.repo || '',
        createdAt: savedTeam.createdAt,
        updatedAt: savedTeam.updatedAt
    };
}

/**
 * Leave a team and delete it if this was the last member
 * @param teamId ID of the team to leave
 * @param userId ID of the user leaving the team
 * @returns boolean indicating success
 */
export async function leaveTeam(teamId: string, userId: string): Promise<boolean> {
    try {
        const dataSource = await ensureDbConnected();
        const teamRepository = dataSource.getRepository(TeamEntity);
        const userRepository = dataSource.getRepository(UserEntity);
        
        // Find team and user
        const team = await teamRepository.findOne({
            where: { id: teamId },
            relations: ['users']
        });
        
        const user = await userRepository.findOne({ where: { id: userId } });
        
        if (!team || !user) {
            return false;
        }
        
        if (team.locked) {
            return false;
        }
        
        team.users = team.users.filter(u => u.id !== userId);
        
        if (team.users.length === 0) {
            if (team.repo) {
                await repositoryApi.deleteRepo(process.env.NEXT_PUBLIC_GITHUB_ORG || "", team.repo);
            }
            await teamRepository.remove(team);
        } else {
            if (team.repo) {
                await repositoryApi.removeCollaborator(process.env.NEXT_PUBLIC_GITHUB_ORG || "", team.repo, user.username);
            }
            await teamRepository.save(team);
        }
        
        return true;
    } catch (err) {
        console.error('Error leaving team:', err);
        return false;
    }
}

/**
 * Get all members of a team
 * @param teamId ID of the team
 * @returns Array of team members
 */
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
        const dataSource = await ensureDbConnected();
        const teamRepository = dataSource.getRepository(TeamEntity);
        
        const team = await teamRepository.findOne({
            where: { id: teamId },
            relations: ['users']
        });
        
        if (!team || !team.users || team.users.length === 0) {
            return [];
        }
        
        return team.users.map(user => ({
            id: user.id,
            name: user.name,
            username: user.username,
            profilePicture: user.profilePicture
        }));
    } catch (err) {
        console.error('Error getting team members:', err);
        return [];
    }
}

/**
 * Search for users that can be invited to a team
 * @param teamId ID of the team to invite to
 * @param eventId ID of the event
 * @param searchQuery query string to search by username or name
 * @returns Array of user search results
 */
export async function searchUsersForInvite(teamId: string, eventId: string, searchQuery: string): Promise<UserSearchResult[]> {
    try {
        const dataSource = await ensureDbConnected();
        const userRepository = dataSource.getRepository(UserEntity);
        const teamRepository = dataSource.getRepository(TeamEntity);
        
        const team = await teamRepository.findOne({
            where: { id: teamId },
            relations: ['teamInvites', 'users']
        });
        
        if (!team) {
            throw new Error("Team not found");
        }
        
        const users = await userRepository.createQueryBuilder('user')
            .innerJoin('user.events', 'event', 'event.id = :eventId', { eventId })
            .where('user.name ILIKE :query OR user.username ILIKE :query', { query: `%${searchQuery}%` })
            .getMany();
        
        const teamUserIds = team.users.map(u => u.id);
        const invitedUserIds = team.teamInvites.map(u => u.id);
        
        const filteredUsers = users.filter(user => !teamUserIds.includes(user.id));
        
        // Return users with isInvited flag set for those who already have invites
        return filteredUsers.map(user => ({
            id: user.id,
            name: user.name,
            username: user.username,
            profilePicture: user.profilePicture,
            isInvited: invitedUserIds.includes(user.id)
        }));
    } catch (err) {
        console.error('Error searching users for invite:', err);
        return [];
    }
}

/**
 * Send a team invite to a user
 * @param teamId ID of the team sending the invite
 * @param userId ID of the user being invited
 * @returns boolean indicating success
 */
export async function sendTeamInvite(teamId: string, userId: string): Promise<boolean> {
    try {
        const dataSource = await ensureDbConnected();
        const teamRepository = dataSource.getRepository(TeamEntity);
        const userRepository = dataSource.getRepository(UserEntity);
        
        const team = await teamRepository.findOne({
            where: { id: teamId },
            relations: ['teamInvites', 'event', 'users']
        });
        
        const user = await userRepository.findOne({
            where: { id: userId },
            relations: ['teams']
        });
        
        if (!team || !user) {
            return false;
        }
        
        if (team.locked) {
            return false;
        }
        
        if (team.users.some(u => u.id === userId)) {
            return false;
        }
        
        if (team.teamInvites.some(u => u.id === userId)) {
            return false;
        }
        
        if (user.teams.some(t => t.event.id === team.event.id)) {
            return false;
        }
        
        team.teamInvites.push(user);
        await teamRepository.save(team);
        
        return true;
    } catch (err) {
        console.error('Error sending team invite:', err);
        return false;
    }
}

/**
 * Get pending team invites for a user
 * @param userId ID of the user
 * @returns Array of team invites with details
 */
export async function getUserPendingInvites(userId: string): Promise<TeamInviteWithDetails[]> {
    try {
        const dataSource = await ensureDbConnected();
        const userRepository = dataSource.getRepository(UserEntity);
        
        const user = await userRepository.findOne({
            where: { id: userId },
            relations: ['teamInvites']
        });
        
        if (!user || !user.teamInvites || user.teamInvites.length === 0) {
            return [];
        }
        
        return user.teamInvites.map(team => ({
            id: team.id,
            teamId: team.id,
            teamName: team.name,
            createdAt: team.createdAt
        }));
    } catch (err) {
        console.error('Error getting user pending invites:', err);
        return [];
    }
}

/**
 * Accept a team invite
 * @param teamId ID of the team that sent the invite
 * @param userId ID of the user accepting the invite
 * @returns Object with success status and optional message
 */
export async function acceptTeamInvite(teamId: string, userId: string): Promise<{ success: boolean, message?: string }> {
    try {
        const dataSource = await ensureDbConnected();
        const teamRepository = dataSource.getRepository(TeamEntity);
        const userRepository = dataSource.getRepository(UserEntity);
        
        const team = await teamRepository.findOne({
            where: { id: teamId },
            relations: ['users', 'teamInvites']
        });
        
        const user = await userRepository.findOne({
            where: { id: userId },
            relations: ['teams']
        });
        
        if (!team || !user) {
            return { success: false, message: "Team or user not found" };
        }
        
        if (team.locked) {
            return { success: false, message: "This team is locked and not accepting new members" };
        }
        
        if (user.teams.some(t => t.event.id === team.event.id)) {
            return { success: false, message: "You are already in a team for this event" };
        }
        
        team.teamInvites = team.teamInvites.filter(u => u.id !== userId);
        team.users.push(user);

        if (team.repo) {
            await repositoryApi.addCollaborator(process.env.NEXT_PUBLIC_GITHUB_ORG || "", team.repo, user.username, "pull");
            await userApi.acceptRepositoryInvitationByRepo(process.env.NEXT_PUBLIC_GITHUB_ORG || "", team.repo, user.githubAccessToken);
        }
        
        await teamRepository.save(team);
        
        return { success: true };
    } catch (err) {
        console.error('Error accepting team invite:', err);
        return { success: false, message: "An error occurred while accepting the invite" };
    }
}

/**
 * Decline a team invite
 * @param teamId ID of the team that sent the invite
 * @param userId ID of the user declining the invite
 * @returns Object with success status and optional message
 */
export async function declineTeamInvite(teamId: string, userId: string): Promise<{ success: boolean, message?: string }> {
    try {
        const dataSource = await ensureDbConnected();
        const teamRepository = dataSource.getRepository(TeamEntity);
        const userRepository = dataSource.getRepository(UserEntity);
        
        const team = await teamRepository.findOne({
            where: { id: teamId },
            relations: ['teamInvites']
        });
        
        const user = await userRepository.findOne({
            where: { id: userId }
        });
        
        if (!team || !user) {
            return { success: false, message: "Team or user not found" };
        }
        
        team.teamInvites = team.teamInvites.filter(u => u.id !== userId);
        
        await teamRepository.save(team);
        
        return { success: true };
    } catch (err) {
        console.error('Error declining team invite:', err);
        return { success: false, message: "An error occurred while declining the invite" };
    }
}

/**
 * Get all teams for a specific event
 * @param eventId ID of the event
 * @returns Array of teams
 */
export async function getTeamsForEvent(eventId: string): Promise<Team[]> {
    try {
        const dataSource = await ensureDbConnected();
        const teamRepository = dataSource.getRepository(TeamEntity);
        
        const teams = await teamRepository
            .createQueryBuilder('team')
            .innerJoin('team.event', 'event')
            .leftJoinAndSelect('team.users', 'users')
            .where('event.id = :eventId', { eventId })
            .getMany();
        
        return teams.map(team => ({
            id: team.id,
            name: team.name,
            repo: team.repo || '',
            membersCount: team.users?.length || 0,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt
        }));
    } catch (err) {
        console.error('Error getting teams for event:', err);
        return [];
    }
}