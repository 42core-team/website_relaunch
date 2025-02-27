'use server'

import pbAdmin from "@/pbaseAdmin";

export interface Team {
    id: string;
    name: string;
    repo: string;
    created: string;
    updated: string;
}

export interface TeamMember {
    id: string;
    name: string;
    avatar?: string;
    username: string;
    collectionId: string;
}

export async function getTeam(userId: string, eventId: string): Promise<Team | null> {
  try {
    const record = await pbAdmin.collection('team_by_user_and_event').getFirstListItem(
      `team_user = "${userId}" && team_event = "${eventId}"`
    );
    return {
      id: record.event_id,
      name: record.team_name,
      repo: record.team_repo,
      created: record.team_created,
      updated: record.team_updated,
    };
  } catch (err) {
    return null;
  }
}

export async function createTeam(name: string, eventId: string, userId: string): Promise<Team> {
    const existingTeam = await getTeam(userId, eventId);
    if (existingTeam)
        return existingTeam;
    const team = await pbAdmin.collection('teams').create<Team>({
        name,
        event: eventId
    });

    // Associate the user with the new team
    await pbAdmin.collection('team_user').create({
        user: userId,
        team: team.id,
    });

    return team;
}

/**
 * Leave a team and delete it if this was the last member
 * @param teamId ID of the team to leave
 * @param userId ID of the user leaving the team
 * @returns boolean indicating success
 */
export async function leaveTeam(teamId: string, userId: string): Promise<boolean> {
    try {
        // Find the team_user record for this user and team
        const teamUserRecord = await pbAdmin.collection('team_user').getFirstListItem(
            `team = "${teamId}" && user = "${userId}"`
        );
        
        if (!teamUserRecord) {
            return false;
        }
        
        // Delete the team_user record
        await pbAdmin.collection('team_user').delete(teamUserRecord.id);
        
        // Check if there are any other users in the team
        const remainingTeamUsers = await pbAdmin.collection('team_user').getFullList({
            filter: `team = "${teamId}"`,
        });
        
        // If this was the last user, delete the team
        if (remainingTeamUsers.length === 0) {
            await pbAdmin.collection('teams').delete(teamId);
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
        // Get all team_user records for this team
        const teamUserRecords = await pbAdmin.collection('team_user').getFullList({
            filter: `team = "${teamId}"`,
        });
        
        if (!teamUserRecords || teamUserRecords.length === 0) {
            return [];
        }
        
        // Get user IDs
        const userIds = teamUserRecords.map(record => record.user);
        
        // Fetch user details for each user ID
        const members: TeamMember[] = [];
        
        for (const userId of userIds) {
            try {
                const user = await pbAdmin.collection('users').getOne(userId, {
                    fields: 'id,name,username,avatar,collectionId'
                });
                
                if (user) {
                    members.push({
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        avatar: user.avatar,
                        collectionId: user.collectionId
                    });
                }
            } catch (error) {
                console.error(`Error fetching user ${userId}:`, error);
            }
        }
        
        return members;
    } catch (err) {
        console.error('Error getting team members:', err);
        return [];
    }
}