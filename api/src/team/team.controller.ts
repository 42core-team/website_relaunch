import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {FrontendGuard, UserId} from "../guards/FrontendGuard";
import {TeamService} from "./team.service";

@UseGuards(FrontendGuard)
@Controller('team')
export class TeamController {
    constructor(private readonly teamService: TeamService) {
    }

    @Get(":id")
    getTeamById(@Param("id") id: string) {
        return this.teamService.getTeamById(id);
    }

    @Get("event/:eventId/my")
    getMyTeamForEvent(@Param("eventId") eventId: string, @UserId('id') userId: string) {
        return this.teamService.getTeamOfUserForEvent(eventId, userId);
    }
}
