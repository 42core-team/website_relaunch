import {Injectable, Logger} from '@nestjs/common';
import {TeamService} from "../team/team.service";
import {InjectRepository} from "@nestjs/typeorm";
import {MatchEntity, MatchPhase, MatchState} from "./entites/match.entity";
import {Not, Repository} from "typeorm";
import {Swiss} from "tournament-pairings"
import {EventService} from "../event/event.service";
// @ts-ignore
import {Player} from "tournament-pairings/interfaces";
import {EventEntity, EventState} from "../event/entities/event.entity";
import {ClientProxy, ClientProxyFactory} from "@nestjs/microservices";
import {getRabbitmqConfig} from "../main";
import {ConfigService} from "@nestjs/config";
import {TeamEntity} from "../team/entities/team.entity";

@Injectable()
export class MatchService {

    private gameResultsQueue: ClientProxy;
    private logger = new Logger("MatchService");

    constructor(
        private readonly teamService: TeamService,
        private readonly eventService: EventService,
        @InjectRepository(MatchEntity)
        private readonly matchRepository: Repository<MatchEntity>,
        configService: ConfigService
    ) {
        this.gameResultsQueue = ClientProxyFactory.create(getRabbitmqConfig(configService, "game_results"));
    }

    async processMatchResult(matchId: string, winnerId: string) {
        const match = await this.matchRepository.findOne({
            where: {id: matchId},
            relations: {
                teams: {
                    event: true
                },
                winner: true,
            }
        });

        if (!match)
            throw new Error(`Match with id ${matchId} not found.`);

        if (match.state !== MatchState.IN_PROGRESS)
            throw new Error(`Match with id ${matchId} is not in READY state.`);

        const winner = match.teams.find(team => team.id === winnerId);
        if (!winner)
            throw new Error(`Winner with id ${winnerId} not found in match teams.`);

        match.winner = winner;
        match.state = MatchState.FINISHED;

        await this.teamService.increaseTeamScore(winner.id, 1);
        await this.matchRepository.save(match);
        this.logger.log(`Match with id ${matchId} finished. Winner: ${winner.name}`);

        const event = match.teams[0].event;
        if (!event) {
            throw new Error(`Event for match with id ${matchId} not found.`);
        }

        const notFinishedMatches = await this.matchRepository.count({
            where: {
                teams: {
                    event: {
                        id: event.id
                    }
                },
                state: Not(MatchState.FINISHED),
                phase: match.phase,
                round: match.round
            }
        })

        if (notFinishedMatches > 0)
            return;

        if (match.phase == MatchPhase.SWISS)
            return this.processSwissFinishRound(event.id);
        else if (match.phase == MatchPhase.ELIMINATION)
            return this.processTournamentFinishRound(event);
        throw new Error(`Unknown match phase: ${match.phase}`);
    }

    async processSwissFinishRound(evenId: string) {
        const event = await this.eventService.getEventById(evenId, {
            teams: true
        })

        await this.eventService.increaseEventRound(evenId);
        this.logger.log(`Event ${event.name} has finished round ${event.currentRound}.`);
        if (event.currentRound + 1 >= this.getMaxSwissRounds(event.teams.length)) {
            this.logger.log(`Event ${event.name} has reached the maximum Swiss rounds.`);
            await this.eventService.setCurrentRound(event.id, 0);
            await this.calculateBuchholzPoints(event.id);
            await this.eventService.setEventState(event.id, EventState.ELIMINATION_ROUND);
            return;
        }

        await this.createNextSwissMatches(event.id);
    }

    async processTournamentFinishRound(event: EventEntity) {
        const finishedMatches = await this.matchRepository.countBy({
            teams: {
                event: {
                    id: event.id
                }
            },
            state: MatchState.FINISHED,
            phase: MatchPhase.ELIMINATION,
            round: event.currentRound
        })

        if (finishedMatches == 0) {
            throw new Error(`No finished matches found for event ${event.name} in round ${event.currentRound}.`);
        }

        if (finishedMatches == 1) {
            this.logger.log(`Event ${event.name} has finished the final match.`);
            await this.eventService.setEventState(event.id, EventState.FINISHED);
            return;
        }

        await this.eventService.increaseEventRound(event.id);
        this.logger.log(`Event ${event.name} has finished round ${event.currentRound}.`);
        await this.createNextTournamentMatches(event.id);
    }

    async startMatch(matchId: string) {
        const match = await this.matchRepository.findOne({
            where: {id: matchId},
            relations: {
                teams: true,
                winner: true
            }
        });

        if (!match)
            throw new Error(`Match with id ${matchId} not found.`);

        if (match.state !== MatchState.PLANNED)
            throw new Error(`Match with id ${matchId} is not in PLANNED state.`);

        match.state = MatchState.IN_PROGRESS;
        await this.matchRepository.save(match);


        this.gameResultsQueue.emit("success", {
            team_results: match.teams.map(team => ({
                id: team.id,
                name: team.name,
                place: Math.random() * 10
            })),
            "game_end_reason": 0,
            "version": "1.0.0",
            "game_id": matchId
        })
    }

    async createMatch(teamIds: string[], round: number, phase: MatchPhase) {
        console.log("create match with teamIds: ", teamIds, " round: ", round, " phase: ", phase);
        const match = this.matchRepository.create({
            teams: teamIds.map(id => ({id})),
            round,
            phase,
            state: MatchState.PLANNED
        });

        return this.matchRepository.save(match);
    }

    async getFormerOpponents(teamId: string): Promise<TeamEntity[]>{
        const matches = await this.matchRepository.find({
            where: {
                teams: {
                    id: teamId
                },
                state: MatchState.FINISHED,
                phase: MatchPhase.SWISS
            },
            relations: {
                teams: true
            }
        });

        const opponents = new Set<TeamEntity>();
        for (const match of matches) {
            for (const team of match.teams) {
                if (team.id !== teamId) {
                    opponents.add(team);
                }
            }
        }

        return Array.from(opponents);

    }

    async createNextSwissMatches(eventId: string) {
        const event = await this.eventService.getEventById(eventId, {
            teams: true
        });

        if (event.state != EventState.SWISS_ROUND)
            throw new Error("Event is not in swiss round state.");

        if (event.currentRound != 0 && await this.matchRepository.findOneBy({
            teams: {
                event: {
                    id: eventId
                }
            },
            round: event.currentRound,
            state: MatchState.IN_PROGRESS, // TODO need to change later to MatchState.PLANNED
            phase: MatchPhase.SWISS
        })) {
            this.logger.error("Not all matches of the current round are finished. Cannot create Swiss matches.");
            throw new Error("Not all matches of the current round are finished. Cannot create Swiss matches.");
        }

        const maxSwissRounds = this.getMaxSwissRounds(event.teams.length);
        if (event.currentRound >= maxSwissRounds) {
            this.logger.error(`Cannot create Swiss matches for event ${event.name} in round ${event.currentRound}. Maximum rounds reached: ${maxSwissRounds}`);
            throw new Error(`Maximum Swiss rounds reached for event ${event.name}.`);
        }

        const players: Player[] = await Promise.all(event.teams.map(async team => ({
            id: team.id,
            score: team.score,
            receivedBye: team.hadBye,
            avoid: await this.getFormerOpponents(team.id).then(opponents => opponents.map(opponent => opponent.id)),
            rating: true
        })))

        const matches = Swiss(players, event.currentRound)
        const matchEntities: (MatchEntity | null)[] = await Promise.all(matches.map(async match => {
            if (match.player1 === match.player2) {
                this.logger.error(`Player ${match.player1} cannot be paired with themselves in Swiss pairing.`);
                throw new Error("A player cannot be paired with themselves in Swiss pairing.");
            }

            if (!match.player1 || !match.player2) {
                this.logger.log(`The team ${match.player1 || match.player2} got a bye in round ${event.currentRound} of event ${event.name}.`);
                await this.teamService.setHadBye((match.player1 || match.player2) as string, true);
                return null;
            }
            return this.createMatch([match.player1 as string, match.player2 as string], event.currentRound, MatchPhase.SWISS);
        }));
        const filteredMatchEntities = matchEntities.filter((match): match is MatchEntity => match !== null);

        this.logger.log(`Created ${filteredMatchEntities.length} Swiss matches for event ${event.name} in round ${event.currentRound}.`);
        for (let matchEntity of filteredMatchEntities)
            await this.startMatch(matchEntity.id)
        return filteredMatchEntities;
    }

    async createFirstTournamentMatches(event: EventEntity) {
        const teamsCount = event.teams.length;
        const highestPowerOfTwo = Math.pow(2, Math.floor(Math.log2(teamsCount)));

        if (highestPowerOfTwo < 2) {
            throw new Error("Not enough teams to create matches for the first round of the tournament. Minimum 2 teams required.");
        }

        const sortedTeams = await this.teamService.getSortedTeamsForTournament(event.id);

        this.logger.log(`start tournament with ${highestPowerOfTwo} teams for event ${event.name}`);

        for (let i = 0; i < highestPowerOfTwo; i += 2) {
            const team1 = sortedTeams[i];
            const team2 = sortedTeams[i + 1];

            if (!team1 || !team2) {
                throw new Error("Not enough teams to create matches for the first round of the tournament.");
            }

            const newMatch = await this.createMatch([team1.id, team2.id], 0, MatchPhase.ELIMINATION);
            await this.startMatch(newMatch.id);
        }

        this.logger.log(`Created next tournament matches for event ${event.name} in round ${event.currentRound + 1}.`);
    }

    async createNextTournamentMatches(eventId: string) {
        const event = await this.eventService.getEventById(eventId, {
            teams: true
        });

        if (event.state != EventState.ELIMINATION_ROUND)
            throw new Error("Event is not in elimination round state.");

        if (event.currentRound == 0)
            return this.createFirstTournamentMatches(event);

        const lastMatches = await this.matchRepository.find({
            where: {
                teams: {
                    event: {
                        id: eventId
                    }
                },
                round: event.currentRound - 1,
                state: MatchState.FINISHED,
                phase: MatchPhase.ELIMINATION
            },
            relations: {
                winner: true
            },
            order: {
                createdAt: "ASC"
            }
        })

        if (lastMatches.length == 0) {
            throw new Error("No finished matches found for the last round. Cannot create next tournament matches.");
        }

        if (lastMatches.length % 2 != 0) {
            throw new Error("Odd number of matches in the last round. Cannot create next tournament matches.");
        }

        for (let i = 0; i < lastMatches.length; i += 2) {
            const match = lastMatches[i];
            const nextMatch = lastMatches[i + 1];

            if (!match.winner || !nextMatch.winner) {
                throw new Error("One of the matches does not have a winner. Cannot create next tournament matches.");
            }

            const newMatch = await this.createMatch([match.winner.id, nextMatch.winner.id], event.currentRound, MatchPhase.ELIMINATION);
            await this.startMatch(newMatch.id);
        }

        this.logger.log(`Created next tournament matches for event ${event.name} in round ${event.currentRound}.`);
    }

    async getSwissMatches(eventId: string) {
        return await this.matchRepository.find({
            where: {
                teams: {
                    event: {
                        id: eventId
                    }
                },
                phase: MatchPhase.SWISS
            },
            relations: {
                teams: true,
                winner: true
            }
        })
    }

    getMaxSwissRounds(teams: number): number {
        return Math.ceil(Math.log2(teams));
    }

    async getTournamentTeamCount(eventId: string) {
        const teamsCount = await this.teamService.getTeamCountForEvent(eventId);
        return Math.pow(2, Math.floor(Math.log2(teamsCount)));
    }

    async calculateBuchholzPoints(eventId: string): Promise<void> {
        const teams = await this.teamService.getTeamsForEvent(eventId);

        await Promise.all(teams.map(async (team) => {
            const buchholzPoints = await this.calculateBuchholzPointsForTeam(team.id, eventId);
            this.logger.log(`Calculated Buchholz points for team ${team.name} (${team.id}): ${buchholzPoints}`);
            await this.teamService.updateBuchholzPoints(team.id, buchholzPoints);
        }))
    }

    async calculateBuchholzPointsForTeam(teamId: string, eventId: string): Promise<number> {
        const wonMatches = await this.matchRepository.find({
            where: {
                winner: {
                    id: teamId
                }
            },
            relations: {
                teams: true
            }
        })

        let sum = 0;
        console.log("wonMatches: ", wonMatches.length);
        for (const match of wonMatches) {
            const opponent = match.teams.find(team => team.id !== teamId);
            if (opponent)
                sum += opponent.score;
        }
        return sum;
    }

    getTournamentMatches(eventId: string) {
        return this.matchRepository.find({
            where: {
                teams: {
                    event: {
                        id: eventId
                    }
                },
                phase: MatchPhase.ELIMINATION
            },
            relations: {
                teams: true,
                winner: true
            },
            order: {
                createdAt: "ASC"
            }
        });
    }
}
