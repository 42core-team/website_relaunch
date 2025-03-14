'use server'

import {ensureDbConnected} from "@/initializer/database";
import {EventEntity} from "@/entities/event.entity";
import {UserEntity} from "@/entities/users.entity";
import {TeamEntity} from "@/entities/team.entity";
import {MatchEntity, MatchState} from "@/entities/match.entity";
import {Swiss} from "tournament-pairings";
// @ts-ignore
import {Player, Match} from 'tournament-pairings/interfaces';

export interface Event {
    id: string;
    start_date: string;
    name: string;
    description?: string;
    location?: string;
    end_date: string;
    min_team_size: number;
    max_team_size: number;
    currentRound: number;
}

export async function getTeamsToAvoid(teamId: string): Promise<string[]> {
    const dataSource = await ensureDbConnected();
    const matchRepository = dataSource.getRepository(MatchEntity);
    const eventRepository = dataSource.getRepository(EventEntity);

    const pastMatches = await matchRepository.find({
        where: {
            teams: {
                id: teamId
            }
        },
        relations: {
            teams: true
        }
    })

    const pastOpponents = pastMatches.map(p => p.teams.map(t => t.id)).flat();
    return pastOpponents.filter(id => id !== teamId);
}

export async function calculateNextGroupPhaseMatches(eventId: string): Promise<boolean> {
    const dataSource = await ensureDbConnected();
    const teamsRepository = dataSource.getRepository(TeamEntity);
    const eventRepository = dataSource.getRepository(EventEntity);
    const matchRepository = dataSource.getRepository(MatchEntity);
    const event = await getEventById(eventId);
    if (!event) return false;

    const teams = await teamsRepository.find({
        where: {
            event: {
                id: eventId
            }
        }
    })
    const maxRounds = Math.ceil(Math.log2(teams.length));
    if (event.currentRound >= maxRounds)
        return false;

    const nextRound = event.currentRound + 1;
    const matchableTeams = await Promise.all(teams.map(async (team: TeamEntity): Promise<Player> => {
        const teamsToAvoid = await getTeamsToAvoid(team.id);
        return {
            id: team.id,
            score: team.score,
            avoid: teamsToAvoid,
            receivedBye: team.hadBye
        }
    }))

    const matches = Swiss(matchableTeams, nextRound, true);
    const newMatches = matches.map(match => {
        const newMatch = new MatchEntity();
        newMatch.state = MatchState.PLANNED
        newMatch.round = nextRound;
        [match.player1, match.player2].forEach((player) => {
            const team = teams.find(t => t.id === player);
            if (team) {
                newMatch.teams.push(team);
            }
        })
        return newMatch;
    })

    await matchRepository.save(newMatches);
    await eventRepository.update(eventId, {
        currentRound: nextRound
    })
    return true
}

export async function getEventById(eventId: string): Promise<Event | null> {
    const dataSource = await ensureDbConnected();
    const eventRepository = dataSource.getRepository(EventEntity);
    const event = await eventRepository.findOne({where: {id: eventId}});

    if (!event) return null;

    return {
        id: event.id,
        name: event.name,
        description: event.description,
        location: event.location,
        start_date: event.startDate.toISOString(),
        end_date: event.endDate.toISOString(),
        min_team_size: event.minTeamSize,
        max_team_size: event.maxTeamSize,
        currentRound: event.currentRound
    };
}

export async function isUserRegisteredForEvent(userId: string, eventId: string): Promise<boolean> {
    const dataSource = await ensureDbConnected();
    const userRepository = dataSource.getRepository(UserEntity);

    // Check if user is directly linked to the event
    const userPartOfEvent = await userRepository
        .createQueryBuilder('user')
        .innerJoin('user.events', 'event')
        .where('user.id = :userId', {userId})
        .andWhere('event.id = :eventId', {eventId})
        .getOne();

    if (userPartOfEvent) {
        return true;
    }

    return false;
}

export async function shouldShowJoinNotice(userId: string, eventId: string): Promise<boolean> {
    const isRegistered = await isUserRegisteredForEvent(userId, eventId);
    if (isRegistered)
        return false;

    const event = await getEventById(eventId);
    if (!event) {
        return false;
    }

    const startDate = new Date(event.start_date);
    const isStartDateInFuture = startDate > new Date();

    return isStartDateInFuture;
}

// Get all events
export async function getEvents(limit: number = 50): Promise<Event[]> {
    const dataSource = await ensureDbConnected();
    const eventRepository = dataSource.getRepository(EventEntity);

    const events = await eventRepository.find({
        order: {startDate: 'ASC'},
        take: limit
    });

    return events.map(event => ({
        id: event.id,
        name: event.name,
        description: event.description,
        location: event.location,
        start_date: event.startDate.toISOString(),
        end_date: event.endDate.toISOString(),
        min_team_size: event.minTeamSize,
        max_team_size: event.maxTeamSize,
        currentRound: event.currentRound
    }));
}

export async function getTeamsCountForEvent(eventId: string): Promise<number> {
    const dataSource = await ensureDbConnected();
    const eventRepository = dataSource.getRepository(EventEntity);

    const event = await eventRepository.findOne({
        where: {id: eventId},
        relations: ['teams']
    });

    return event?.teams?.length || 0;
}

// Get total participants count for an event
export async function getParticipantsCountForEvent(eventId: string): Promise<number> {
    const dataSource = await ensureDbConnected();
    const teamRepository = dataSource.getRepository(TeamEntity);

    const result = await teamRepository
        .createQueryBuilder('team')
        .innerJoin('team.event', 'event')
        .innerJoin('team.users', 'user')
        .where('event.id = :eventId', {eventId})
        .select('COUNT(DISTINCT user.id)', 'count')
        .getRawOne();

    return parseInt(result?.count || '0', 10);
}

// Join a user to an event
export async function joinEvent(userId: string, eventId: string): Promise<boolean> {
    try {
        const dataSource = await ensureDbConnected();
        const eventRepository = dataSource.getRepository(EventEntity);
        const userRepository = dataSource.getRepository(UserEntity);

        const isRegistered = await shouldShowJoinNotice(userId, eventId);
        if (!isRegistered) {
            return false;
        }

        // Get user and event
        const user = await userRepository.findOne({
            where: {id: userId},
            relations: ['events']
        });

        const event = await eventRepository.findOne({
            where: {id: eventId},
            relations: ['users']
        });

        if (!user || !event) {
            console.error('User or event not found');
            return false;
        }

        // Add user to event
        if (!event.users) {
            event.users = [];
        }

        event.users.push(user);
        await eventRepository.save(event);

        return true;
    } catch (error) {
        console.error('Error joining event:', error);
        return false;
    }
} 
