import {
    Controller,
    Get,
    Param,
    Body,
    Post,
    UseGuards,
    BadRequestException,
    Put,
    NotFoundException, Delete, Query
} from '@nestjs/common';
import {FrontendGuard, UserId} from "../guards/FrontendGuard";
import {TeamService} from "./team.service";
import {CreateTeamDto} from "./dtos/ createTeamDto";
import {InviteUserDto} from "./dtos/inviteUserDto";
import {UserService} from "../user/user.service";

@UseGuards(FrontendGuard)
@Controller('team')
export class TeamController {
    constructor(
        private readonly teamService: TeamService,
        private readonly userService: UserService
    ) {
    }

    @Get(":id")
    getTeamById(@Param("id") id: string) {
        return this.teamService.getTeamById(id);
    }

    @Get("event/:eventId")
    getTeamsForEvent
    (@Param("eventId") eventId: string,
     @Query("searchName") searchName?: string,
     @Query("sortDir") sortDir?: string,
     @Query("sortBy") sortBy?: string
    ) {
        return this.teamService.getTeamsForEvent(eventId, searchName, sortDir, sortBy);
    }

    @Get("event/:eventId/my")
    getMyTeamForEvent(@Param("eventId") eventId: string, @UserId('id') userId: string) {
        return this.teamService.getTeamOfUserForEvent(eventId, userId);
    }

    @Post("event/:eventId/create")
    async createTeam(
        @UserId() userId: string,
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
        @UserId() userId: string,
        @Param("eventId") eventId: string
    ) {
        const team = await this.teamService.getTeamOfUserForEvent(eventId, userId);
        if (!team) throw new NotFoundException("You are not part of a team for this event.");
        if (team.locked) throw new BadRequestException("You cannot leave a locked team.");

        return this.teamService.leaveTeam(team.id, userId);
    }

    @Get(":id/members")
    async getTeamMembers(
        @Param("id") teamId: string,
    ) {
        const team = await this.teamService.getTeamById(teamId, {
            users: true
        });

        return team.users
    }

    @Post("event/:eventId/sendInvite")
    async sendInviteToTeam(
        @UserId() userId: string,
        @Param("eventId") eventId: string,
        @Body() inviteUserDto: InviteUserDto
    ) {
        const team = await this.teamService.getTeamOfUserForEvent(eventId, userId);
        if (!team) throw new NotFoundException("You are not part of a team for this event.");
        if (team.locked) throw new BadRequestException("You cannot send invites for a locked team.");
        if (await this.teamService.getTeamOfUserForEvent(eventId, inviteUserDto.userToInviteId))
            throw new BadRequestException("This user is already part of a team for this event.");
        if (await this.teamService.isUserInvitedToTeam(inviteUserDto.userToInviteId, team.id))
            throw new BadRequestException("This user is already invited to this team.");

        return this.userService.addTeamInvite(inviteUserDto.userToInviteId, team.id);
    }

    @Get("event/:eventId/searchInviteUsers/:searchQuery")
    async searchUsersForInvite(
        @Param("eventId") eventId: string,
        @UserId() userId: string,
        @Param('searchQuery') searchQuery: string
    ) {
        const team = await this.teamService.getTeamOfUserForEvent(eventId, userId);
        if (!team) throw new NotFoundException("You are not part of a team for this event.");
        if (team.locked) throw new BadRequestException("You cannot search for users in a locked team.");

        return this.userService.searchUsersForInvite(eventId, searchQuery, team.id);
    }

    @Get("event/:eventId/pending")
    async getUserPendingInvites(
        @UserId() userId: string,
        @Param("eventId") eventId: string
    ) {
        return this.teamService.getTeamsUserIsInvitedTo(userId, eventId);
    }

    @Put("event/:eventId/acceptInvite/:teamId")
    async acceptTeamInvite(
        @UserId() userId: string,
        @Param("eventId") eventId: string,
        @Param("teamId") teamId: string
    ) {
        if (await this.teamService.getTeamOfUserForEvent(eventId, userId))
            throw new BadRequestException("You are already part of a team for this event.");
        if (!await this.teamService.isUserInvitedToTeam(userId, teamId))
            throw new BadRequestException("You are not invited to this team.");
        const team = await this.teamService.getTeamById(teamId);
        if (team.locked)
            throw new BadRequestException("You cannot accept an invite to a locked team.");

        return this.teamService.acceptTeamInvite(userId, teamId);
    }

    @Delete("event/:eventId/declineInvite/:teamId")
    async declineTeamInvite(
        @UserId() userId: string,
        @Param("eventId") eventId: string,
        @Param("teamId") teamId: string
    ) {
        if (!await this.teamService.isUserInvitedToTeam(userId, teamId))
            throw new BadRequestException("You are not invited to this team.");

        return this.teamService.declineTeamInvite(userId, teamId);
    }
}
