import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {EventService} from "./event.service";
import {FrontendGuard, UserId} from "../guards/FrontendGuard";

@UseGuards(FrontendGuard)
@Controller('event')
export class EventController {
    constructor(private readonly eventService: EventService) {
    }

    @Get(":id")
    getEventById(@Param("id") id: string) {
        return this.eventService.getEventById(id);
    }

    @Get(":id/isUserRegistered")
    getEventByUserId(@Param("id") eventId: string, @UserId() userId: string) {
        return this.eventService.isUserRegisteredForEvent(eventId, userId);
    }
}
