'use server'

import { ensureDbConnected } from "@/initializer/database";
import { EventEntity, EventState } from "@/entities/event.entity";
import { getMaxSwissRounds, calculateNextGroupPhaseMatches, createSingleEliminationBracket } from "@/app/actions/event";
import { TeamEntity } from "@/entities/team.entity";
import { MatchEntity, MatchPhase, MatchState } from "@/entities/match.entity";


async function handleTeamFindingState(eventId: string): Promise<boolean> {
	const dataSource = await ensureDbConnected();
	const eventRepository = dataSource.getRepository(EventEntity);
	
	await eventRepository.update(eventId, {
		state: EventState.CODING_PHASE
	});
	console.log("TEAM_FINDING -> CODING_PHASE");
	return true;
}

async function handleCodingPhaseState(eventId: string): Promise<boolean> {
	const dataSource = await ensureDbConnected();
	const eventRepository = dataSource.getRepository(EventEntity);
	
	await eventRepository.update(eventId, {
		state: EventState.SWISS_ROUND,
		currentRound: 0
	});
	console.log("CODING_PHASE -> SWISS_ROUND");
	return true;
}

async function handleSwissRoundState(eventId: string, event: EventEntity, teams: TeamEntity[], currentSwissRoundFinished: MatchEntity[], maxRounds: number): Promise<boolean> {
	const dataSource = await ensureDbConnected();
	const eventRepository = dataSource.getRepository(EventEntity);
	
	// Check if we need to create the first round of Swiss matches
	if (event.currentRound === 0) {
		await calculateNextGroupPhaseMatches(eventId);
	
		await eventRepository.update(eventId, {
			currentRound: 1
		});
		console.log("SWISS_ROUND -> SWISS_ROUND (Created first round matches)");
		return true;
	}
	
	// Otherwise, check if all existing matches are finished
	if (!(currentSwissRoundFinished.length * 2 === teams.length || (currentSwissRoundFinished.length * 2) + 1 === teams.length)){
		console.log("Not all matches finished in swiss round");
		return false;
	}
	await addPointsToTeams(eventId); // TODO: Temporary
	
	// Handle transition to elimination round or next swiss round
	if (event.currentRound >= maxRounds) {
		await eventRepository.update(eventId, {
			state: EventState.ELIMINATION_ROUND,
			currentRound: 0
		});
		console.log("SWISS_ROUND -> ELIMINATION_ROUND");
		return true;
	} else {
		// Create matches for the next round
		await calculateNextGroupPhaseMatches(eventId);
		await eventRepository.update(eventId, {
			currentRound: event.currentRound + 1
		});
		console.log("SWISS_ROUND -> SWISS_ROUND (Advanced to next round)");
		return true;
	}
}

async function handleEliminationRoundState(eventId: string, event: EventEntity, currentEliminationRoundFinished: MatchEntity[]): Promise<boolean> {
	const dataSource = await ensureDbConnected();
	const eventRepository = dataSource.getRepository(EventEntity);
	
	// Handle initial bracket creation
	if (event.currentRound === 0) {
		console.log("Creating initial bracket");
		await calcMedianBuchholzPoints(eventId); // TODO: Temporary
		const qualifiedTeams = await getQualifiedTeams(eventId);
		console.log(qualifiedTeams);
		return true;
	} 
	// Handle advancing to next elimination round
	else if (currentEliminationRoundFinished.length === 16 / Math.pow(2, event.currentRound)) { // TODO: Replace with relative number to allow different bracket sizes / double elimination
		await eventRepository.update(eventId, {
			currentRound: event.currentRound + 1
		});
		console.log("ELIMINATION_ROUND -> ELIMINATION_ROUND");
		return true;
	}
	
	console.log("ELIMINATION_ROUND -> ELIMINATION_ROUND");
	return false; // TODO: Might be incorrect
}

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
			state: MatchState.FINISHED,
			teams: {
				event: {
					id: eventId
				}
			}
		},
		relations: {
			teams: {
				event: true
			}
		}
	});

	const currentEliminationRoundFinished = await MatchRepository.find({
		where: {
			phase: MatchPhase.ELIMINATION,
			round: event.currentRound,
			state: MatchState.FINISHED
		},
		relations: {
			teams: {
				event: true
			}
		}
	});

	// Handle different event states
	if (event.state === EventState.SWISS_ROUND) {
		return await handleSwissRoundState(eventId, event, teams, currentSwissRoundFinished, maxRounds);
	} else if (event.state === EventState.ELIMINATION_ROUND) {
		return await handleEliminationRoundState(eventId, event, currentEliminationRoundFinished);
	} else if (event.state === EventState.TEAM_FINDING) {
		return await handleTeamFindingState(eventId);
	} else if (event.state === EventState.CODING_PHASE) {
		return await handleCodingPhaseState(eventId);
	} else if (event.state === EventState.FINISHED) {
		console.log("FINISHED");
		return false;
	} else {
		console.log("Unknown state: " + event.state);
		return false;
	}
}

// TODO: Really neccesary? Or Jonas backend part does this?
export async function addPointsToTeams(eventId: string): Promise<boolean> {
	const dataSource = await ensureDbConnected();
	const TeamRepository = dataSource.getRepository(TeamEntity);
	const eventRepository = dataSource.getRepository(EventEntity);
	const MatchRepository = dataSource.getRepository(MatchEntity);

	// Get the current event to know the current round
	const event = await eventRepository.findOne({
		where: { id: eventId }
	});

	if (!event) return false;

	// Find all finished matches for the current round
	const finishedMatches = await MatchRepository.find({
		where: {
			phase: MatchPhase.SWISS,
			round: event.currentRound,
			state: MatchState.FINISHED
		},
		relations: ['winner']
	});

	// Update the score for each winning team
	for (const match of finishedMatches) {
		if (match.winner) {
			await TeamRepository.update(match.winner.id, {
				score: () => "score + 10"
			});
		}
	}

	return true;
}

export async function getQualifiedTeams(eventId: string): Promise<TeamEntity[]> {
	const dataSource = await ensureDbConnected();
	const TeamRepository = dataSource.getRepository(TeamEntity);

	const teams = await TeamRepository.find({
		where: {
			event: {
				id: eventId
			}
		}
	});

	teams.sort((a, b) => {
		const scoreDiff = (b.score + Number(b.hadBye) * 10) - (a.score + Number(a.hadBye) * 10);
		if (scoreDiff !== 0) return scoreDiff;
		return a.id.localeCompare(b.id); 
	});

	return teams.slice(0, 16); // make variable based on bracket size
}

export async function insertNextMatches(eventId: string): Promise<boolean> {
	const dataSource = await ensureDbConnected();
	const eventRepository = dataSource.getRepository(EventEntity);
	const MatchRepository = dataSource.getRepository(MatchEntity);

	const event = await eventRepository.findOne({
		where: { id: eventId }
	});
	
	if (!event) return false;		
	

	return false;
}


export async function calcMedianBuchholzPoints(eventId: string): Promise<boolean> {
	const dataSource = await ensureDbConnected();
	const TeamRepository = dataSource.getRepository(TeamEntity);

	const teams = await TeamRepository.find({
		where: {
			event: {
				id: eventId
			}
		},
		relations: ['matches', 'matches.teams', 'matches.winner']
	});

	for (const team of teams) {
		const swissMatches = team.matches.filter(match =>
			match.phase === MatchPhase.SWISS &&
			match.state === MatchState.FINISHED
		);
		
		const opponentScores: number[] = [];
		
		for (const match of swissMatches) {
			const opponent = match.teams.find(t => t.id !== team.id);
			
			if (opponent) {
				opponentScores.push(opponent.score);
			}
		}
		
		if (team.hadBye) {
			opponentScores.push(0);
		}
		
		// Calculation for median Buchholz points
		let buchholzPoints = 0;
		
		if (opponentScores.length > 0) {
			opponentScores.sort((a, b) => a - b);
			
			if (opponentScores.length >= 3) {
				// Remove lowest and highest score
				opponentScores.shift();
				opponentScores.pop();
			}
			
			buchholzPoints = opponentScores.reduce((sum, score) => sum + score, 0);
		}
		
		await TeamRepository.update(team.id, {
			buchholzPoints: buchholzPoints
		});
	}
	return true;
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

// Functions: 
// General:
// - Increase round!!!!!!!!!
// -- subfunctions for: increase swiss round, increase elimination round, change phases, 
// - Get current round
// - Get max rounds
//  
//
// Swiss:
//
// Bracket:
// Consistent function for initial team bracket assignment
//  




// Client side:
// Swiss:
// - Always Render Labels (Round number)
//
// Bracket:
// - Render Tree function (variable based on single / double elimination)
// - Display progression based on winners of initial state