import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    UnauthorizedException,
    UseGuards
} from '@nestjs/common';
import {EventService} from "./event.service";
import {FrontendGuard, UserId} from "../guards/FrontendGuard";
import {TeamService} from "../team/team.service";
import {UserService} from "../user/user.service";
import {CreateEventDto} from "./dtos/createEventDto";

@UseGuards(FrontendGuard)
@Controller('event')
export class EventController {
    constructor(
        private readonly eventService: EventService,
        private readonly teamService: TeamService,
        private readonly userService: UserService
    ) {
    }

    @Get()
    getAllEvents() {
        return this.eventService.getAllEvents();
    }

    @Get(":id")
    getEventById(@Param("id") id: string) {
        return this.eventService.getEventById(id);
    }

    @Post()
    createEvent(
        @UserId() userId: string,
        @Body() createEventDto: CreateEventDto
    ) {
        if (!this.userService.canCreateEvent(userId))
            throw new UnauthorizedException("You are not authorized to create events.");

        return this.eventService.createEvent(
            userId,
            createEventDto.name,
            createEventDto.description,
            createEventDto.githubOrg,
            createEventDto.githubOrgSecret,
            createEventDto.location,
            createEventDto.startDate,
            createEventDto.endDate,
            createEventDto.minTeamSize,
            createEventDto.maxTeamSize,
            createEventDto.treeFormat,
            createEventDto.repoTemplateOwner,
            createEventDto.repoTemplateName
        )
    }

    @Get(":id/teamsCount")
    getTeamsCountForEvent(@Param("id") eventId: string) {
        return this.teamService.getTeamCountForEvent(eventId);
    }

    @Get(":id/participantsCount")
    getParticipantsCountForEvent(@Param("id") eventId: string) {
        return this.userService.getUserCountOfEvent(eventId);
    }

    @Get(":id/isUserRegistered")
    getEventByUserId(@Param("id") eventId: string, @UserId() userId: string) {
        return this.eventService.isUserRegisteredForEvent(eventId, userId);
    }

    @Get(":id/isEventAdmin")
    isEventAdmin(@Param("id") eventId: string, @UserId() userId: string) {
        return this.eventService.isEventAdmin(eventId, userId);
    }

    @Put(":id/join")
    async joinEvent(@Param("id") eventId: string, @UserId() userId: string) {
        const isRegistered = await this.eventService.isUserRegisteredForEvent(eventId, userId);
        if (isRegistered) {
            throw new BadRequestException("User is already registered for this event.");
        }

        return this.userService.joinEvent(eventId, userId);
    }

    @Put(":id/lock")
    async lockEvent(@Param("id") eventId: string, @UserId() userId: string) {
        const isAdmin = await this.eventService.isEventAdmin(eventId, userId);
        if (!isAdmin)
            throw new UnauthorizedException("You are not authorized to lock this event.");

        return this.eventService.lockEvent(eventId);
    }
}
