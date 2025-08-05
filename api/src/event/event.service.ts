import {forwardRef, Inject, Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {EventEntity, EventState} from "./entities/event.entity";
import {Repository, UpdateResult} from "typeorm";
import {PermissionRole} from "../user/entities/user.entity";
import * as CryptoJS from "crypto-js";
import {ConfigService} from "@nestjs/config";
import {TeamService} from "../team/team.service";
import {FindOptionsRelations} from "typeorm/find-options/FindOptionsRelations";

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(EventEntity)
        private readonly eventRepository: Repository<EventEntity>,
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => TeamService)) private readonly teamService: TeamService
    ) {
    }

    logger = new Logger("EventService");

    getAllEvents(): Promise<EventEntity[]> {
        return this.eventRepository.find({
            order: {
                startDate: "ASC"
            }
        });
    }

    async getEventById(id: string, relations: FindOptionsRelations<EventEntity> = {}): Promise<EventEntity> {
        return await this.eventRepository.findOneOrFail({
            where: {id},
            relations
        });
    }

    createEvent(
        userId: string,
        name: string,
        description: string,
        githubOrg: string,
        githubOrgSecret: string,
        location: string,
        startDate: number,
        endDate: number,
        minTeamSize: number,
        maxTeamSize: number,
        treeFormat?: number,
        repoTemplateOwner?: string,
        repoTemplateName?: string
    ) {
        githubOrgSecret = CryptoJS.AES.encrypt(githubOrgSecret, this.configService.getOrThrow("API_SECRET_ENCRYPTION_KEY")).toString()

        return this.eventRepository.save({
            name,
            description,
            githubOrg,
            githubOrgSecret,
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

    increaseEventRound(eventId: string): Promise<UpdateResult> {
        return this.eventRepository.increment({id: eventId}, "currentRound", 1)
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

    async lockEvent(eventId: string) {
        const event = await this.eventRepository.findOneOrFail({
            where: {
                id: eventId
            },
            relations: {
                teams: true
            }
        });

        await Promise.all(event.teams.map(async (team) => {
            try {
                await this.teamService.lockTeam(team.id);
            } catch (e) {
                this.logger.error(`Failed to lock team ${team.id} for event ${eventId}`, e);
            }
        }))
    }

    async setEventState(eventId: string, eventState: EventState) {
        return this.eventRepository.update(eventId, {
            state: eventState
        })
    }

    async setCurrentRound(eventId: string, round: number): Promise<UpdateResult> {
        return this.eventRepository.update(eventId, {
            currentRound: round
        });
    }
}
