import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {EventEntity} from "./entities/event.entity";
import {Repository} from "typeorm";
import {PermissionRole} from "../user/entities/user.entity";

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(EventEntity)
        private readonly eventRepository: Repository<EventEntity>
    ) {
    }

    getAllEvents(): Promise<EventEntity[]> {
        return this.eventRepository.find({
            order: {
                startDate: "ASC"
            }
        });
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

    isEventAdmin(eventId: string, userId: string): Promise<boolean> {
        return this.eventRepository.existsBy({
            id: eventId,
            permissions: {
                user: {
                    id: userId
                },
                role: PermissionRole.ADMIN
            }
        });
    }
}
