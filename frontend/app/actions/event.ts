'use server'

import {ensureDbConnected} from "@/initializer/database";
import {EventEntity, EventState, EventType} from "@/entities/event.entity";
import {UserEntity} from "@/entities/users.entity";
import {TeamEntity} from "@/entities/team.entity";
import {MatchEntity, MatchPhase, MatchState} from "@/entities/match.entity";
import {SingleElimination, Swiss} from "tournament-pairings";
// @ts-ignore
import {Match, Player} from 'tournament-pairings/interfaces';
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/utils/authOptions";

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
    event_type?: string;
    tree_format?: number;
    repo_template_owner?: string;
    repo_template_name?: string;
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

export async function getMaxSwissRounds(teams: number): Promise<number> {
    return Math.ceil(Math.log2(teams));
}

// To be deprecated
export async function createSingleEliminationBracket(eventId: string): Promise<boolean> {
    const dataSource = await ensureDbConnected();
    const teamsRepository = dataSource.getRepository(TeamEntity);
    const matchRepository = dataSource.getRepository(MatchEntity);
    const eventRepository = dataSource.getRepository(EventEntity);

    const event = await eventRepository.findOne({
        where: { id: eventId },
        relations: ['teams']
    });

    if (!event) return false;

    // Check if elimination bracket already exists
    const existingMatches = await matchRepository.find({
        where: {
            phase: MatchPhase.ELIMINATION,
            teams: {
                event: { id: eventId }
            }
        },
        relations: ['teams', 'winner']
    });

    // CASE 1: No elimination matches yet - create initial bracket
    if (existingMatches.length === 0) {
        // Verify Swiss rounds are complete
        const maxSwissRounds = await getMaxSwissRounds(event.teams.length);
        if (event.currentRound < maxSwissRounds) {
            console.log("Swiss rounds not complete yet");
            return false;
        }

        // Get teams ordered by score for seeding
        const teams = await teamsRepository.find({
            where: { event: { id: eventId } },
            order: { score: 'DESC'},
            take: 16
        });

        if (teams.length < 2) return false;

        // Create player objects for tournament-pairings
        const players: Player[] = teams.map(team => ({
            id: team.id,
            name: team.name,
            score: team.score,
            receivedBye: team.hadBye
        }));

        // Generate single elimination bracket
        const matches = SingleElimination(players);

        // Create match entities
        const matchEntities: MatchEntity[] = [];

        matches.forEach((match, index) => {
            const roundNumber = Math.ceil(Math.log2(matches.length + 1)) - Math.floor(Math.log2(index + 1));

            const newMatch = new MatchEntity();
            newMatch.state = MatchState.PLANNED;
            newMatch.round = roundNumber;
            newMatch.phase = MatchPhase.ELIMINATION;
            newMatch.teams = [];

            // Add teams if they're not byes
            if (match.player1) {
                const team1 = teams.find(t => t.id === match.player1);
                if (team1) newMatch.teams.push(team1);
            }

            if (match.player2) {
                const team2 = teams.find(t => t.id === match.player2);
                if (team2) newMatch.teams.push(team2);
            }

            // If a match has only one team, it's a bye - set winner immediately
            if (newMatch.teams.length === 1) {
                newMatch.winner = newMatch.teams[0];
                newMatch.state = MatchState.FINISHED;
            }

            matchEntities.push(newMatch);
        });

        // Save match entities
        await matchRepository.save(matchEntities);

        // Update event state
        await eventRepository.update(eventId, {
            state: EventState.ELIMINATION_ROUND,
            currentRound: 1
        });

        return true;
    }

    console.log("fhjewriofjewiofjweoifjewoifejwio")

    // CASE 2: Elimination matches exist - advance winners

    // Find current round
    const currentRound = Math.max(...existingMatches.map(m => m.round));

    // Get finished matches from current round that have winners
    const finishedMatches = existingMatches.filter(
        match => match.round === currentRound &&
            match.state === MatchState.FINISHED &&
            match.winner
    );

    // Get next round matches
    const nextRoundMatches = existingMatches.filter(
        match => match.round === currentRound - 1 &&
            match.state === MatchState.PLANNED
    );

    // If no next round matches, tournament is complete
    if (nextRoundMatches.length === 0) {
        // Check if we have a final winner
        const finalMatch = existingMatches.find(m => m.round === 1);

        if (finalMatch?.winner) {
            // Tournament is complete, update event state
            await eventRepository.update(eventId, {
                state: EventState.FINISHED
            });
        }

        return true;
    }

    // Update next round matches with winners
    for (const nextMatch of nextRoundMatches) {
        // Find which matches feed into this one (2 matches per next match)
        const feedingMatches = finishedMatches.filter(m => {
            // Calculate index ranges to determine which matches feed into which
            const matchesPerRound = Math.pow(2, currentRound - 1);
            const matchesInNextRound = matchesPerRound / 2;
            const matchesPerNextMatch = matchesPerRound / matchesInNextRound;

            // Calculate the index range for the current next match
            const nextMatchIndex = nextRoundMatches.indexOf(nextMatch);
            const startIdx = nextMatchIndex * matchesPerNextMatch;
            const endIdx = startIdx + matchesPerNextMatch;

            // Find the current match's index in its round
            const currentMatchIndex = finishedMatches.indexOf(m);

            return currentMatchIndex >= startIdx && currentMatchIndex < endIdx;
        });

        // Get winners from feeding matches
        const winners = feedingMatches.map(m => m.winner).filter(Boolean);

        // Add winners to next match
        nextMatch.teams = winners;

        // If we have two teams, match is ready to play
        if (winners.length === 2) {
            nextMatch.state = MatchState.READY;
        }
        // If we have only one winner and no other matches feed in, they win by default
        else if (winners.length === 1) {
            nextMatch.winner = winners[0];
            nextMatch.state = MatchState.FINISHED;
        }
    }

    // Save updated matches
    await matchRepository.save(nextRoundMatches);

    // Update event's current round
    await eventRepository.update(eventId, {
        currentRound: event.currentRound + 1
    });

    return true;
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
    const maxRounds= await getMaxSwissRounds(teams.length)
    if (event.currentRound >= maxRounds)
        return false;

    const nextRound = event.currentRound + 1;
    const matchableTeams: Player[] = await Promise.all(teams.map(async (team: TeamEntity): Promise<Player> => {
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
        newMatch.phase = MatchPhase.SWISS
        newMatch.teams = [];
        [match.player1, match.player2].forEach((player) => {
            const team = teams.find(t => t.id === player);
            if (team) {
                newMatch.teams.push(team);
            }
        })
        return newMatch;
    })

    await matchRepository.save(newMatches);
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
        currentRound: event.currentRound,
        event_type: event.type,
        tree_format: event.treeFormat,
        repo_template_owner: event.repoTemplateOwner,
        repo_template_name: event.repoTemplateName
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
        currentRound: event.currentRound,
        event_type: event.type,
        tree_format: event.treeFormat,
        repo_template_owner: event.repoTemplateOwner,
        repo_template_name: event.repoTemplateName
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

// Interface for creating events
interface EventCreateParams {
    name: string;
    description?: string;
    location?: string;
    startDate: string;
    endDate: string;
    minTeamSize: number;
    maxTeamSize: number;
    treeFormat?: number;
    eventType?: string;
    repoTemplateOwner?: string;
    repoTemplateName?: string;
}

// Create a new event
export async function createEvent(eventData: EventCreateParams): Promise<Event | { error: string }> {
    try {
        const dataSource = await ensureDbConnected();
        const eventRepository = dataSource.getRepository(EventEntity);
        const userRepository = dataSource.getRepository(UserEntity);
        
        // Get current user from session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { error: "User not authenticated" };
        }
        
        // Check if user has permission to create events
        const user = await userRepository.findOne({ where: { id: session.user.id } });
        if (!user || !user.canCreateEvent) {
            return { error: "You don't have permission to create events" };
        }
        
        // Validate dates
        const startDate = new Date(eventData.startDate);
        const endDate = new Date(eventData.endDate);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return { error: "Invalid date format" };
        }
        
        if (startDate >= endDate) {
            return { error: "End date must be after start date" };
        }
        
        if (startDate < new Date()) {
            return { error: "Start date cannot be in the past" };
        }
        
        // Validate team sizes
        if (eventData.minTeamSize <= 0 || eventData.maxTeamSize <= 0) {
            return { error: "Team sizes must be positive" };
        }
        
        if (eventData.minTeamSize > eventData.maxTeamSize) {
            return { error: "Minimum team size cannot be greater than maximum team size" };
        }
        
        // Validate tree format
        const treeFormat = eventData.treeFormat || 16;
        if (treeFormat !== 16) {
            return { error: "Only tournament size of 16 is supported at this time" };
        }
        
        // Validate repo template (both owner and name must be provided if either is)
        if ((eventData.repoTemplateOwner && !eventData.repoTemplateName) || 
            (!eventData.repoTemplateOwner && eventData.repoTemplateName)) {
            return { error: "Both repository template owner and name must be provided" };
        }
        
        // Create new event
        const newEvent = new EventEntity();
        newEvent.name = eventData.name;
        newEvent.description = eventData.description || "";
        newEvent.location = eventData.location || "";
        newEvent.startDate = startDate;
        newEvent.endDate = endDate;
        newEvent.minTeamSize = eventData.minTeamSize;
        newEvent.maxTeamSize = eventData.maxTeamSize;
        newEvent.state = EventState.TEAM_FINDING;
        newEvent.currentRound = 0;
        newEvent.type = eventData.eventType === "RUSH" ? EventType.RUSH : EventType.REGULAR;
        newEvent.treeFormat = treeFormat;
        
        // Set repository template owner and name if provided
        if (eventData.repoTemplateOwner && eventData.repoTemplateName) {
            newEvent.repoTemplateOwner = eventData.repoTemplateOwner;
            newEvent.repoTemplateName = eventData.repoTemplateName;
        }
        
        newEvent.users = [user]; // Add the creator as a user of the event
        
        const savedEvent = await eventRepository.save(newEvent);
        
        // Return the created event
        return {
            id: savedEvent.id,
            name: savedEvent.name,
            description: savedEvent.description,
            location: savedEvent.location,
            start_date: savedEvent.startDate.toISOString(),
            end_date: savedEvent.endDate.toISOString(),
            min_team_size: savedEvent.minTeamSize,
            max_team_size: savedEvent.maxTeamSize,
            currentRound: savedEvent.currentRound,
            event_type: savedEvent.type,
            tree_format: savedEvent.treeFormat,
            repo_template_owner: savedEvent.repoTemplateOwner,
            repo_template_name: savedEvent.repoTemplateName
        };
    } catch (error) {
        console.error('Error creating event:', error);
        return { error: "An unexpected error occurred" };
    }
}

// Check if the current user has permission to create events
export async function canUserCreateEvent(): Promise<boolean> {
    try {
        const dataSource = await ensureDbConnected();
        const userRepository = dataSource.getRepository(UserEntity);
        
        // Get current user from session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return false;
        }
        
        // Check if user has permission to create events
        const user = await userRepository.findOne({ where: { id: session.user.id } });
        return user?.canCreateEvent || false;
    } catch (error) {
        console.error('Error checking event creation permission:', error);
        return false;
    }
} 
