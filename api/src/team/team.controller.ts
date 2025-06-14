import {
    Controller,
    Get,
    Param,
    Body,
    Post,
    UseGuards,
    BadRequestException,
    Put,
    NotFoundException
} from '@nestjs/common';
import {FrontendGuard, UserId} from "../guards/FrontendGuard";
import {TeamService} from "./team.service";
import {CreateTeamDto} from "./dtos/ createTeamDto";

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

    @Post("event/:eventId/create")
    async createTeam(
        @UserId('id') userId: string,
        @Param("eventId") eventId: string,
        @Body() createTeamDto: CreateTeamDto
    ) {
        if (await this.teamService.getTeamOfUserForEvent(eventId, userId))
            throw new BadRequestException("You already have a team for this event.");

        if (await this.teamService.existsTeamByName(createTeamDto.name, eventId))
            throw new BadRequestException("A team with this name already exists for this event.");


        return this.teamService.createTeam(createTeamDto.name, userId, eventId);
    }

    @Put("event/:eventId/leave")
    async leaveTeam(
        @UserId('id') userId: string,
        @Param("eventId") eventId: string
    ) {
        const team = await this.teamService.getTeamOfUserForEvent(eventId, userId);
        if (!team) throw new NotFoundException("You are not part of a team for this event.");
        if (team.locked) throw new BadRequestException("You cannot leave a locked team.");

        return this.teamService.leaveTeam(team.id, userId);
    }

    @Get("event/:eventId/members")
    async getTeamMembers(
        @Param("eventId") eventId: string,
        @UserId('id') userId: string
    ) {
        const team = await this.teamService.getTeamOfUserForEvent(eventId, userId, {
            users: true
        });
        if (!team) throw new NotFoundException("You are not part of a team for this event.");

        return team.users
    }
}
