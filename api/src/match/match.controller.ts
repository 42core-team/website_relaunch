import {Controller, Get, Param, Put} from '@nestjs/common';
import {MatchService} from "./match.service";

@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService) {
    }

    @Get("swiss/:eventId")
    getSwissMatches(@Param("eventId") eventId: string) {
        return this.matchService.getSwissMatches(eventId);
    }

    @Put("swiss/:eventId")
    createSwissMatches(@Param("eventId") eventId: string) {
        return this.matchService.createSwissMatches(eventId);
    }
}
