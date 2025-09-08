import {forwardRef, Inject, Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {EventEntity, EventState} from "./entities/event.entity";
import {DataSource, LessThanOrEqual, Repository, UpdateResult} from "typeorm";
import {PermissionRole} from "../user/entities/user.entity";
import * as CryptoJS from "crypto-js";
import {ConfigService} from "@nestjs/config";
import {TeamService} from "../team/team.service";
import {FindOptionsRelations} from "typeorm/find-options/FindOptionsRelations";
import {Cron, CronExpression} from "@nestjs/schedule";
import { EventVersionDto } from './dtos/eventVersionDto';

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(EventEntity)
        private readonly eventRepository: Repository<EventEntity>,
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => TeamService)) private readonly teamService: TeamService,
        private dataSource: DataSource
    ) {
    }

    logger = new Logger("EventService");

    @Cron(CronExpression.EVERY_MINUTE)
    async autoLockEvents() {
        const lockKey = 12345;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        try {
            const gotLock = await queryRunner.query(
                'SELECT pg_try_advisory_lock($1)',
                [lockKey],
            );

            if (gotLock[0].pg_try_advisory_lock) {
                try {
                    const events = await this.eventRepository.findBy({
                        areTeamsLocked: false,
                        state: EventState.CODING_PHASE,
                        repoLockDate: LessThanOrEqual(new Date())
                    })
                    for (const event of events) {
                        this.logger.log(`Locking event ${event.name} as it past its repoLockDate date.`);
                        await this.lockEvent(event.id);
                    }
                } finally {
                    await queryRunner.query('SELECT pg_advisory_unlock($1)', [lockKey]);
                }
            }
        } finally {
            await queryRunner.release();
        }
    }

    getAllEvents(): Promise<EventEntity[]> {
        return this.eventRepository.find({
            where: {
                isPrivate: false,
            },
            order: {
                startDate: "ASC"
            }
        });
    }

    async getEventsForUser(userId: string): Promise<EventEntity[]> {
        return this.eventRepository.find({
            where: {
                users: {
                    id: userId,
                },
            },
            order: {
                startDate: "ASC",
            },
        });
    }

    async getEventById(id: string, relations: FindOptionsRelations<EventEntity> = {}): Promise<EventEntity> {
        return await this.eventRepository.findOneOrFail({
            where: {id},
            relations
        });
    }

    async getEventByTeamId(teamId: string, relations: FindOptionsRelations<EventEntity> = {}): Promise<EventEntity> {
        return await this.eventRepository.findOneOrFail({
            where: {
                teams: {
                    id: teamId
                }
            },
            relations
        });
    }

    async getEventVersion(id: string): Promise<EventVersionDto> {
        const event = await this.eventRepository.findOneOrFail({
            where: {id},
        });

        return {
            gameServerVersion: event.gameServerDockerImage,
            myCoreBotVersion: event.myCoreBotDockerImage,
            visualizerVersion: event.visualizerDockerImage,
        };
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
        repoTemplateOwner?: string,
        repoTemplateName?: string,
        gameServerDockerImage?: string,
        myCoreBotDockerImage?: string,
        visualizerDockerImage?: string,
        monorepoUrl?: string,
        isPrivate: boolean = false,
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
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            permissions: [
                {
                    user: {
                        id: userId
                    },
                    role: PermissionRole.ADMIN
                }
            ],
            users: [
                {
                    id: userId
                }
            ],
            gameServerDockerImage,
            myCoreBotDockerImage,
            visualizerDockerImage,
            monorepoUrl,
            isPrivate
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

        await this.setEventState(event.id, EventState.SWISS_ROUND);
        return this.eventRepository.update(eventId, {
            areTeamsLocked: true
        });
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

    async setTeamsLockedDate(eventId: string, date: Date | null): Promise<UpdateResult> {
        return this.eventRepository.update(eventId, {
            repoLockDate: date,
        });
    }
}
