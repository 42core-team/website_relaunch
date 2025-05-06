'use server'

import {prisma} from "@/initializer/database";
import {Team as PrismaTeam, User as PrismaUser, Event as PrismaEvent} from "@/generated/prisma";
import {repositoryApi, userApi, rushRepositoryApi, rushUserApi} from "@/initializer/github";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/utils/authOptions";
import {isEventAdmin} from "@/app/actions/event";

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
    const team = await prisma.team.findUnique({
        where: { id: teamId },
    });

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
        const team = await prisma.team.findFirst({
            where: {
                members: {
                    some: {
                        usersId: userId
                    }
                },
                eventId: eventId,
            }
        });

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

export async function lockEvent(eventId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !await isEventAdmin(session.user.id, eventId)) {
        return {error: "User not authenticated"};
    }

    try {
        const teams = await prisma.team.findMany({
            where: {
                eventId: eventId,
                locked: false
            },
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                event: true
            }
        });

        await Promise.all(teams.map(async (team) => {
            return await lockTeamRepository(team, team.members.map(member => member.user), team.event);
        }));
    } catch (err) {
        console.error('Error locking event:', err);
    }
}

async function lockTeamRepository(team: PrismaTeam, members: PrismaUser[], event: PrismaEvent): Promise<{ success: boolean; message?: string }> {
    try {
        if (!team.repo) {
            return {success: false, message: "Team has no repository"};
        }

        if (team.locked) {
            return {success: true, message: "Repository is already locked"};
        }

        // Determine if it's a rush event and select appropriate API
        const isRushEvent = event.type === EventType.RUSH;
        const repoApi = isRushEvent ? rushRepositoryApi : repositoryApi;
        const orgName = isRushEvent ? process.env.NEXT_PUBLIC_RUSH_ORG : process.env.NEXT_PUBLIC_GITHUB_ORG;

        // Get all collaborators
        const collaborators = await members.map(member => member.username);

        // Set all collaborators to read-only permissions
        const updatePromises = collaborators.map(async (collaborator) => {
            await repoApi.updateCollaboratorPermission(orgName || "", team.repo, collaborator, "pull");
        });

        await Promise.all(updatePromises);

        // Update team status in database

        await prisma.team.update({
            where: { id: team.id },
            data: { locked: true }
        })

        return {success: true, message: "Repository locked successfully"};
    } catch (err) {
        console.error('Error locking team repository:', err);
        return {success: false, message: "An error occurred while locking the repository"};
    }
}

export async function createTeam(name: string, eventId: string, userId: string): Promise<Team | { error: string }> {
    const existingTeam = await getTeam(userId, eventId);
    if (existingTeam)
        return existingTeam;

    // Get user and event entities
    const user = await prisma.user.findUnique({where: {id: userId}});
    const event = await prisma.event.findUnique({where: {id: eventId}});

    if (!user || !event) {
        throw new Error("User or event not found");
    }

    const teamNameExistsCount = await prisma.team.count({
        where: {
            name: {
                equals: name,
                mode: 'insensitive',
            },
        }
    })

    if (teamNameExistsCount) {
        return {error: `A team with the name "${name}" already exists for this event.`};
    }

    const savedTeam = await prisma.team.create({
        data: {
            name: name,
            eventId: eventId,
            locked: false,
            repo: '',
            score: 0,
            buchholzPoints: 0,
            hadBye: false,
            members: {
                create: [
                  {
                    user: {
                      connect: { id: userId },
                    },
                  },
                ],
              },
            },
          });

    // Use event's template if available, otherwise use default template
    const templateOwner = event.repoTemplateOwner;
    const templateRepo = event.repoTemplateName;

    try {
        // Use different repo API and organization based on event type
        const isRushEvent = event.type === EventType.RUSH;
        const repoApi = isRushEvent ? rushRepositoryApi : repositoryApi;
        const uApi = isRushEvent ? rushUserApi : userApi;
        const orgName = isRushEvent ? process.env.NEXT_PUBLIC_RUSH_ORG : process.env.NEXT_PUBLIC_GITHUB_ORG;

        const repo = await repoApi.createRepoFromTemplate(templateOwner, templateRepo, {
            owner: orgName || "",
            name: event.name + "-" + savedTeam.name + "-" + savedTeam.id,
            private: true,
        });

        savedTeam.repo = repo.name;
        await prisma.team.update({
            where: { id: savedTeam.id },
            data: { repo: repo.name }
        });
        await repoApi.addCollaborator(orgName || "", repo.name, user.username, "push");
        await uApi.acceptRepositoryInvitationByRepo(orgName || "", repo.name, user.githubAccessToken);
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
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: { members: true, event: true },
        });

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!team || !user) {
            return false;
        }

        if (team.locked) {
            return false;
        }

        const updatedMembers = team.members.filter(member => member.usersId !== userId);

        // Determine if it's a rush event and select appropriate API and org
        const isRushEvent = team.event?.type === EventType.RUSH;
        const repoApi = isRushEvent ? rushRepositoryApi : repositoryApi;
        const orgName = isRushEvent ? process.env.NEXT_PUBLIC_RUSH_ORG : process.env.NEXT_PUBLIC_GITHUB_ORG;

        if (team.members.length === 0) {
            if (team.repo) {
                await repoApi.deleteRepo(orgName || "", team.repo);
            }
            await prisma.team.delete({ where: { id: teamId } });
        } else {
            if (team.repo) {
                await repoApi.removeCollaborator(orgName || "", team.repo, user.username);
            }
            await prisma.team.update({
                where: { id: teamId },
                data: {
                    members: {
                        delete: [
                            {
                                teamsId_usersId: {
                                    teamsId: teamId,
                                    usersId: userId,
                                },
                            },
                        ],
                    }
                },
            });
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
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: { members: { include: { user: true } } },
        });

        if (!team || !team.members || team.members.length === 0) {
            return [];
        }

        return team.members.map(member => ({
            id: member.user.id,
            name: member.user.name,
            username: member.user.username,
            profilePicture: member.user.profilePicture,
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
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: { invites: true, members: true },
        });

        if (!team) {
            throw new Error("Team not found");
        }

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                    eventUsers: {
                        some: {
                            eventsId: eventId,
                        },
                    }
                    },
                    {
                        OR: [
                            { name: { search: searchQuery } },
                            { username: { search: searchQuery } },
                        ]
                    }
                ],
            },
        }); 

        const teamUserIds = team.members.map(u => u.usersId);
        const invitedUserIds = team.invites.map(u => u.usersId);

        const filteredUsers = users.filter(user => !teamUserIds.includes(user.id));

        // Return users with isInvited flag set for those who already have invites
        return filteredUsers.map(user => ({
            id: user.id,
            name: user.name,
            username: user.username,
            profilePicture: user.profilePicture,
            isInvited: invitedUserIds.includes(user.id),
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
        const team = await prisma.team.findUnique({
            where: {id: teamId},
            include: {
                event: true,
                members: true,
                invites: true,
            }
        });

        const user = await prisma.user.findUnique({
            where: {id: userId},
            include: {
                memberOfTeams: {
                    include: {
                        team: {
                            include: {
                                event: true,
                            }
                        }
                    }
                }
            },
        });

        if (!team || !user) {
            return false;
        }

        if (team.locked) {
            return false;
        }

        if (team.members.some(u => u.usersId === userId)) {
            return false;
        }

        if (team.invites.some(u => u.usersId === userId)) {
            return false;
        }

        if (user.memberOfTeams.some(t => t.team.eventId === team.event.id)) {
            return false;
        }

        await prisma.team.update({
            where: { id: teamId },
            data: {
                invites: {
                    create: {
                        usersId: userId,
                    }
                }
            }
        });

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
        const user = await prisma.user.findUnique({
            where: {id: userId},
            include: {
                invitedToTeams: {
                    include: {
                        team: true,
                    }
                }
            }
        });

        if (!user || user.invitedToTeams.length === 0) {
            return [];
        }

        return user.invitedToTeams.map(team => ({
            id: team.team.id,
            teamId: team.team.id,
            teamName: team.team.name,
            createdAt: team.team.createdAt
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
export async function acceptTeamInvite(teamId: string, userId: string): Promise<{
    success: boolean,
    message?: string
}> {
    try {
        const team = await prisma.team.findUnique({
            where: {id: teamId},
            include: {
                members: true,
                invites: true,
                event: true,
            }
        });

        const user = await prisma.user.findUnique({
            where: {id: userId},
            include: {
                memberOfTeams: {
                    include: {
                        team: true,
                    }
                }
            }
        });

        if (!team || !user) {
            return {success: false, message: "Team or user not found"};
        }

        if (team.locked) {
            return {success: false, message: "This team is locked and not accepting new members"};
        }

        if (user.memberOfTeams.some(t => t.team.eventId === team.event.id)) {
            return {success: false, message: "You are already in a team for this event"};
        }

        if (team.repo) {
            // Determine if it's a rush event and select appropriate API and org
            const isRushEvent = team.event.type === EventType.RUSH;
            const repoApi = isRushEvent ? rushRepositoryApi : repositoryApi;
            const uApi = isRushEvent ? rushUserApi : userApi;
            const orgName = isRushEvent ? process.env.NEXT_PUBLIC_RUSH_ORG : process.env.NEXT_PUBLIC_GITHUB_ORG;

            await repoApi.addCollaborator(orgName || "", team.repo, user.username, "push");
            await uApi.acceptRepositoryInvitationByRepo(orgName || "", team.repo, user.githubAccessToken);
        }

        await prisma.team.update({
            where: { id: teamId },
            data: {
                members: {
                    create: {
                        usersId: userId,
                    }
                },
                invites: {
                    deleteMany: {
                        usersId: userId,
                    }
                }
            }
        });

        return {success: true};
    } catch (err) {
        console.error('Error accepting team invite:', err);
        return {success: false, message: "An error occurred while accepting the invite"};
    }
}

/**
 * Decline a team invite
 * @param teamId ID of the team that sent the invite
 * @param userId ID of the user declining the invite
 * @returns Object with success status and optional message
 */
export async function declineTeamInvite(teamId: string, userId: string): Promise<{
    success: boolean,
    message?: string
}> {
    try {
        await prisma.team.update({
            where: { id: teamId },
            data: {
                invites: {
                    deleteMany: {
                        usersId: userId,
                    }
                }
            }
        });

        return {success: true};
    } catch (err) {
        console.error('Error declining team invite:', err);
        return {success: false, message: "An error occurred while declining the invite"};
    }
}

/**
 * Get all teams for a specific event
 * @param eventId ID of the event
 * @returns Array of teams
 */
export async function getTeamsForEvent(eventId: string): Promise<Team[]> {
    try {
        const teams = await prisma.team.findMany({
            where: { eventId },
            include: { members: true },
        });

        return teams.map(team => ({
            id: team.id,
            name: team.name,
            repo: team.repo || '',
            membersCount: team.members.length,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
        }));
    } catch (err) {
        console.error('Error getting teams for event:', err);
        return [];
    }
}