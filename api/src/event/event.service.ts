import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {EventEntity} from "./entities/event.entity";
import {DeepPartial, Repository} from "typeorm";
import {PermissionRole} from "../user/entities/user.entity";
import * as CryptoJS from "crypto-js";
import {ConfigService} from "@nestjs/config";
import {TeamService} from "../team/team.service";

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(EventEntity)
        private readonly eventRepository: Repository<EventEntity>,
        private readonly configService: ConfigService,
        private readonly teamService: TeamService
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

    getEventById(id: string): Promise<EventEntity | null> {
        return this.eventRepository.findOneBy({
            id
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
}
