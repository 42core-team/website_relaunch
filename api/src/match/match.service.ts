import {Injectable, Logger} from '@nestjs/common';
import {TeamService} from "../team/team.service";
import {InjectRepository} from "@nestjs/typeorm";
import {MatchEntity, MatchPhase, MatchState} from "./entites/match.entity";
import {Repository} from "typeorm";
import {Swiss} from "tournament-pairings"
import {EventService} from "../event/event.service";
// @ts-ignore
import {Match, Player} from "tournament-pairings/interfaces";
import {MessagePattern} from "@nestjs/microservices";

@Injectable()
export class MatchService {
    constructor(
        private readonly teamService: TeamService,
        private readonly eventService: EventService,
        @InjectRepository(MatchEntity)
        private readonly matchRepository: Repository<MatchEntity>
    ) {
    }

    logger = new Logger("MatchService");

    @MessagePattern('success')
    async handleMatchSuccess(data: { matchId: string, winnerId: string }) {
        console.log("test")
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

    async createSwissMatches(eventId: string) {
        const event = await this.eventService.getEventById(eventId, {
            teams: true
        });

        if (event.currentRound != 0 && await this.matchRepository.findOneBy({
            teams: {
                event: {
                    id: eventId
                }
            },
            round: event.currentRound,
            state: MatchState.PLANNED,
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

        const players: Player[] = event.teams.map(team => ({
            id: team.id,
            score: team.score,
            receivedBye: team.hadBye
        }))

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
        await this.eventService.increaseEventRound(eventId);
        this.logger.log("Increased event round for event " + event.name + " to " + (event.currentRound + 1));
        return filteredMatchEntities;
    }

    async getSwissMatches(eventId: string) {
        return await this.matchRepository.findBy({
            teams: {
                event: {
                    id: eventId
                }
            },
            phase: MatchPhase.SWISS
        })
    }

    getMaxSwissRounds(teams: number): number {
        return Math.ceil(Math.log2(teams));
    }
}
