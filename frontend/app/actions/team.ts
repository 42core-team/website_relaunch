'use server'

import { ensureDbConnected } from "@/initializer/database";
import { TeamEntity } from "@/entities/team.entity";
import { UserEntity } from "@/entities/users.entity";
import { EventEntity } from "@/entities/event.entity";

export interface Team {
    id: string;
    name: string;
    repo: string;
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
      createdAt: team.createdAt,
      updatedAt: team.updatedAt
    };
  } catch (err) {
    console.error('Error getting team:', err);
    return null;
  }
}

export async function createTeam(name: string, eventId: string, userId: string): Promise<Team> {
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
    
    // Create new team
    const newTeam = teamRepository.create({
        name,
        event,
        users: [user]
    });
    
    const savedTeam = await teamRepository.save(newTeam);
    
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
        
        // Remove user from team
        team.users = team.users.filter(u => u.id !== userId);
        
        // If this was the last user, delete the team
        if (team.users.length === 0) {
            await teamRepository.remove(team);
        } else {
            // Otherwise, just save the updated team
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