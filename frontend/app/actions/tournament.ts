'use server'

import {ensureDbConnected} from "@/initializer/database";
import {EventEntity, EventState} from "@/entities/event.entity";
import { createSingleEliminationBracket, getMaxSwissRounds} from "@/app/actions/event";
import { TeamEntity } from "@/entities/team.entity";
import { MatchEntity, MatchPhase, MatchState } from "@/entities/match.entity";



export async function increaseRound(eventId: string): Promise<boolean> {
	const dataSource = await ensureDbConnected();
	const eventRepository = dataSource.getRepository(EventEntity);
	const TeamRepository = dataSource.getRepository(TeamEntity);
	const MatchRepository = dataSource.getRepository(MatchEntity);

	const event = await eventRepository.findOne({ 
		where: { id: eventId }
	});
	
	const teams = await TeamRepository.find({
		where: {
			event: {
				id: eventId
			}
		}
	});
	
	if (!event) return false;
	
	const maxRounds = await getMaxSwissRounds(teams.length);

	const currentSwissRoundFinished = await MatchRepository.find({
		where: {
			phase: MatchPhase.SWISS,
			round: event.currentRound,
			state: MatchState.FINISHED
		}
	});

	const currentEliminationRoundFinished = await MatchRepository.find({
		where: {
			phase: MatchPhase.ELIMINATION,
			round: event.currentRound,
			state: MatchState.FINISHED
		}
	});

	// Try to change to next phase / round if all previous matches are finished
	if (event.state === EventState.SWISS_ROUND && currentSwissRoundFinished.length === teams.length) {
		if (event.currentRound === maxRounds) {
			await eventRepository.update(eventId, {
				state: EventState.ELIMINATION_ROUND,
				currentRound: 0
			});
			console.log("SWISS_ROUND -> ELIMINATION_ROUND");
			return true;
		} else {
			await eventRepository.update(eventId, {
				currentRound: event.currentRound + 1
			});
			console.log("SWISS_ROUND -> SWISS_ROUND");
			return true;
		}
	} else if (event.state === EventState.ELIMINATION_ROUND) { 
		if (event.currentRound === 0) {
			return await createInitialBracket(eventId);
		} else if (currentEliminationRoundFinished.length === 16 / Math.pow(2, event.currentRound)) { // TODO: Replace with relative number to allow different bracket sizes / double elimination
			await eventRepository.update(eventId, {
				currentRound: event.currentRound + 1
			});
			console.log("ELIMINATION_ROUND -> ELIMINATION_ROUND");
			return true;
		}
		return false; // TODO: Might be incorrect
	} else if (event.state === EventState.TEAM_FINDING) {
		await eventRepository.update(eventId, {
			state: EventState.CODING_PHASE
		});
		console.log("TEAM_FINDING -> CODING_PHASE");
		return true;
	} else if (event.state === EventState.CODING_PHASE) {
		await eventRepository.update(eventId, {
				state: EventState.SWISS_ROUND,
				currentRound: 0
			});
		console.log("CODING_PHASE -> SWISS_ROUND");
		return true;
	} else if (event.state === EventState.FINISHED) {
		return false;
	} else {
		return false;
	}
}

export async function createInitialBracket(eventId: string): Promise<boolean> {
	const dataSource = await ensureDbConnected();
	const eventRepository = dataSource.getRepository(EventEntity);
	
	
	return false;
}

export async function getCurrentPhase(eventId: string): Promise<EventState | null> {
	const dataSource = await ensureDbConnected();
	const eventRepository = dataSource.getRepository(EventEntity);
	
	const event = await eventRepository.findOne({
		where: { id: eventId }
	});
	
	if (!event) return null;
	
	return event.state;
}

export async function getCurrentRound(eventId: string): Promise<number | null> {
	const dataSource = await ensureDbConnected();
	const eventRepository = dataSource.getRepository(EventEntity);
	
	const event = await eventRepository.findOne({
		where: { id: eventId }
	});
	
	if (!event) return null;
	
	return event.currentRound;
}
