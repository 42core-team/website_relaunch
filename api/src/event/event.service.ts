import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {EventEntity, EventType} from "./entities/event.entity";
import {DeepPartial, Repository} from "typeorm";
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

    createEvent(
        userId: string,
        name: string,
        description: string,
        location: string,
        startDate: number,
        endDate: number,
        minTeamSize: number,
        maxTeamSize: number,
        type: EventType,
        treeFormat?: number,
        repoTemplateOwner?: string,
        repoTemplateName?: string
    ) {
        return this.eventRepository.save({
            name,
            description,
            type,
            repoTemplateOwner,
            repoTemplateName,
            location,
            minTeamSize,
            maxTeamSize,
            treeFormat: treeFormat ?? 16,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            permissions: [
                {
                    user: {
                        id: userId
                    },
                    role: PermissionRole.ADMIN
                }
            ]

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
