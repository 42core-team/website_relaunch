import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {EventEntity} from "./entities/event.entity";
import {Repository} from "typeorm";

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(EventEntity)
        private readonly eventRepository: Repository<EventEntity>
    ) {
    }

    getEventById(id: string): Promise<EventEntity | null> {
        return this.eventRepository.findOneBy({
            id
        });
    }

    isUserRegisteredForEvent(eventId: string, userId: string) {
        return this.eventRepository.existsBy({
            id: eventId,
            users: {
                id: userId
            }
        })
    }
}
