import {
    BadRequestException,
    Controller,
    Get,
    Logger,
    Param,
    ParseUUIDPipe,
    Put,
    UnauthorizedException,
    UseGuards
} from '@nestjs/common';
import {MatchService} from "./match.service";
import {Ctx, EventPattern, Payload, RmqContext} from "@nestjs/microservices";
import {EventService} from "../event/event.service";
import {EventState} from "../event/entities/event.entity";
import {FrontendGuard, UserId} from "../guards/FrontendGuard";
import {UserGuard} from "../guards/UserGuard";
import {MatchEntity} from "./entites/match.entity";

@UseGuards(FrontendGuard)
@Controller('match')
export class MatchController {
    constructor(
        private readonly matchService: MatchService,
        private readonly eventService: EventService,
    ) {
    }

    private logger = new Logger("MatchController");

    @EventPattern("game_server")
    async getNotifications(@Payload() data: {
        team_results: {
            id: string,
            name: string,
            place: number
        }[]
        game_id: string,
        BOT_ID_MAPPING: {
            [key: string]: string
        }
    }, @Ctx() context: RmqContext) {
        try {
            this.logger.log(`Processing match result for game_id: ${data.game_id} with results: ${JSON.stringify(data.team_results, null, 2)}`);
            this.logger.log("data: " + JSON.stringify(data, null, 2));
            const winnerId = data.BOT_ID_MAPPING[data.team_results.sort((a, b) => a.place - b.place)[0].id];
            await this.matchService.processMatchResult(data.game_id, winnerId);
        } catch (e) {
            this.logger.error("Error processing match result", e);
        }
    }

    @Get("swiss/:eventId")
    getSwissMatches(
        @Param("eventId", ParseUUIDPipe) eventId:
        string, @UserId() userId: string
    ) {
        return this.matchService.getSwissMatches(eventId, userId);
    }

    @UseGuards(UserGuard)
    @Put("swiss/:eventId")
    async startSwissMatches(@Param("eventId", ParseUUIDPipe) eventId: string, @UserId() userId: string) {
        if (!await this.eventService.isEventAdmin(eventId, userId))
            throw new UnauthorizedException(
                "You are not authorized to lock this event.",
            );
        const event = await this.eventService.getEventById(eventId);
        if (event.currentRound != 0 || event.state != EventState.SWISS_ROUND) {
            throw new BadRequestException("swiss matches have already started")
        }

        return await this.matchService.createNextSwissMatches(eventId);
    }


    @UseGuards(UserGuard)
    @Put("tournament/:eventId")
    async startTournamentMatches(
        @Param("eventId", ParseUUIDPipe) eventId: string,
        @UserId() userId: string
    ) {
        if (!await this.eventService.isEventAdmin(eventId, userId))
            throw new UnauthorizedException(
                "You are not authorized to lock this event.",
            );
        return this.matchService.createNextTournamentMatches(eventId);
    }

    @Get("tournament/:eventId/teamCount")
    getTournamentTeamCount(@Param("eventId", ParseUUIDPipe) eventId: string) {
        return this.matchService.getTournamentTeamCount(eventId);
    }

    @Get("tournament/:eventId")
    getTournamentMatches(
        @Param("eventId", ParseUUIDPipe) eventId: string,
        @UserId() userId: string
    ) {
        return this.matchService.getTournamentMatches(eventId, userId);
    }

    @UseGuards(UserGuard)
    @Get("queue/:eventId")
    async getQueueMatches(@Param("eventId", ParseUUIDPipe) eventId: string, @UserId() userId: string) {
        return await this.matchService.getQueueMatches(eventId, userId);
    }

    @Get("logs/:matchId")
    async getMatchLogs(@Param("matchId", ParseUUIDPipe) matchId: string, @UserId() userId: string) {
        const logs = await this.matchService.getMatchLogs(matchId, userId);
        if (!logs)
            throw new BadRequestException("No logs found for match with id " + matchId);
        return logs;
    }

    @UseGuards(UserGuard)
    @Put("reveal/:matchId")
    async revealMatch(
        @Param("matchId", ParseUUIDPipe) matchId: string,
        @UserId() userId: string
    ) {
        const match = await this.matchService.getMatchById(matchId, {
            teams: {
                event: true
            },
        });
        if (!match)
            throw new BadRequestException("Match not found");

        if (!await this.eventService.isEventAdmin(match.teams[0].event.id, userId))
            throw new UnauthorizedException("You are not authorized to reveal this match.");

        return this.matchService.revealMatch(matchId);
    }

    @Get("match/:matchId")
    async getMatchById(
        @Param("matchId", ParseUUIDPipe) matchId: string
    ): Promise<MatchEntity> {
       return await this.matchService.getMatchById(matchId);
    }
}
