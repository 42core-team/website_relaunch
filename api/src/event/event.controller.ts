import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {EventService} from "./event.service";
import {FrontendGuard, UserId} from "../guards/FrontendGuard";
import {TeamService} from "../team/team.service";

@UseGuards(FrontendGuard)
@Controller('event')
export class EventController {
    constructor(
        private readonly eventService: EventService,
        private readonly teamService: TeamService,
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

    @Get(":id/teamsCount")
    getTeamsCountForEvent(@Param("id") eventId: string) {
        return this.teamService.getTeamCountForEvent(eventId);
    }

    @Get(":id/isUserRegistered")
    getEventByUserId(@Param("id") eventId: string, @UserId() userId: string) {
        return this.eventService.isUserRegisteredForEvent(eventId, userId);
    }

    @Get(":id/isEventAdmin")
    isEventAdmin(@Param("id") eventId: string, @UserId() userId: string) {
        return this.eventService.isEventAdmin(eventId, userId);
    }
}
