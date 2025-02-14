'use server'

import pbaseAdmin from "@/pbaseAdmin";
import pbAdmin from "@/pbaseAdmin";

export interface Team {
    id: string;
    name: string;
    repo: string;
    created: string;
    updated: string;
}

export async function getTeam(userId: string, eventId: string): Promise<Team | null> {
    try {
        const myTeamUser = await pbAdmin.collection('team_user')
            .getFirstListItem(`user = "${userId}"`);
        if (!myTeamUser)
            return null;

        return await pbAdmin.collection('teams').getFirstListItem<Team>(`id = "${myTeamUser.team}" && event = "${eventId}"`);
    } catch (err) {
        return null;
    }
}

export async function createTeam(name: string, eventId: string, userId: string): Promise<Team> {
    const existingTeam = await getTeam(userId, eventId);
    if (existingTeam)
        return existingTeam;

    const team = await pbaseAdmin.collection('teams').create<Team>({
        name,
        event: eventId
    });

    await pbaseAdmin.collection('team_user').create<Team>({
        user: userId,
        team: team.id,
    });

    return team;
}