import {Controller, Get, Logger, Param, Put} from '@nestjs/common';
import {MatchService} from "./match.service";
import {Ctx, EventPattern, Payload, RmqContext} from "@nestjs/microservices";

@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService) {
    }

    private logger = new Logger("MatchController");

    @EventPattern("success")
    async getNotifications(@Payload() data: {
        team_results: {
            id: string,
            name: string,
            place: number
        }[]
        game_id: string
    }, @Ctx() context: RmqContext) {
        try {
            this.logger.log(`Processing match result for game_id: ${data.game_id} with results: ${JSON.stringify(data.team_results, null, 2)}`);
            const winnerId = data.team_results.sort((a, b) => a.place - b.place)[0].id;
            await this.matchService.processMatchResult(data.game_id, winnerId);
        } catch (e) {
            this.logger.error("Error processing match result", e);
        }
    }

    @Get("swiss/:eventId")
    getSwissMatches(@Param("eventId") eventId: string) {
        return this.matchService.getSwissMatches(eventId);
    }

    @Put("swiss/:eventId")
    createSwissMatches(@Param("eventId") eventId: string) {
        return this.matchService.createNextSwissMatches(eventId);
    }

    @Put("tournament/:eventId")
    createTournamentMatches(@Param("eventId") eventId: string) {
        return this.matchService.createNextTournamentMatches(eventId);
    }
}
