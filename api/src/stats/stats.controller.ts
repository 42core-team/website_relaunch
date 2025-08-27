import {Controller, Get} from '@nestjs/common';
import {MatchService} from "../match/match.service";

@Controller('stats')
export class StatsController {
    constructor(private matchService: MatchService) {
    }

    @Get("global" )
    async getGlobalStats() {
        return this.matchService.getGlobalStats();
    }
}
