import {BadRequestException, forwardRef, Inject, Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {TeamEntity} from "./entities/team.entity";
import {Repository} from "typeorm";
import {GithubApiService} from "../github-api/github-api.service";
import {EventService} from "../event/event.service";
import {UserService} from "../user/user.service";
import {FindOptionsRelations} from "typeorm/find-options/FindOptionsRelations";

@Injectable()
export class TeamService {
    constructor(
        @InjectRepository(TeamEntity)
        private readonly teamRepository: Repository<TeamEntity>,
        private readonly githubApiService: GithubApiService,
        @Inject(forwardRef(() => EventService)) private readonly eventService: EventService,
        private readonly userService: UserService
    ) {
    }

    logger = new Logger("TeamService");

    getTeamById(id: string, relations: FindOptionsRelations<TeamEntity> = {}): Promise<TeamEntity> {
        return this.teamRepository.findOneOrFail({
            where: {id},
            relations
        })
    }

    getTeamOfUserForEvent(eventId: string, userId: string, relations: FindOptionsRelations<TeamEntity> = {}): Promise<TeamEntity | null> {
        return this.teamRepository.findOne({
            where: {
                event: {
                    id: eventId
                },
                users: {
                    id: userId
                }
            },
            relations
        });
    }

    async lockTeam(teamId: string) {
        const team = await this.teamRepository.findOneOrFail({
            where: {
                id: teamId
            },
            relations: {
                users: true,
                event: true
            }
        })

        await Promise.all(team.users.map(async (user) => {
            try {
                await this.githubApiService.removeWritePermissionsForUser(
                    user.username,
                    team.event.githubOrg,
                    team.repo,
                    team.event.githubOrgSecret
                );
            } catch (e) {
                this.logger.error(`Failed to remove write permissions for user ${user.username} in team ${teamId}`, e);
            }
        }))

        return this.teamRepository.update(teamId, {
            locked: true
        });
    }

    async createTeam(name: string, userId: string, eventId: string) {
        const event = await this.eventService.getEventById(eventId);
        const user = await this.userService.getUserById(userId);
        const team = await this.teamRepository.save({
            name,
            event: {id: eventId},
            users: [{id: userId}],
        })

        const repoName = event.name + '-' + name + '-' + team.id;
        try {
            await this.githubApiService.createTeamRepository(
                repoName,
                user.username,
                user.githubAccessToken,
                event.githubOrg,
                event.githubOrgSecret,
                event.repoTemplateOwner,
                event.repoTemplateName
            );

            team.repo = repoName;
            await this.teamRepository.save(team);
        } catch (e) {
            this.logger.error(`Failed to create repository for team ${team.id}`, e);
            await this.teamRepository.delete(team.id);
            throw new BadRequestException("Failed to create repository for team. Please try again later.");
        }

        return team;
    }

    async deleteTeam(teamId: string) {
        const team = await this.getTeamById(teamId, {
            event: true
        });

        if (team.repo)
            await this.githubApiService.deleteRepository(
                team.repo,
                team.event.githubOrg,
                team.event.githubOrgSecret
            );
        return this.teamRepository.delete(teamId);
    }

    async leaveTeam(teamId: string, userId: string) {
        const team = await this.getTeamById(teamId, {
            users: true,
            event: true
        })
        const user = await this.userService.getUserById(userId);

        await this.githubApiService.removeUserFromRepository(team.repo, user.username, team.event.githubOrg, team.event.githubOrgSecret)
        await this.teamRepository.createQueryBuilder().relation("users")
            .of(teamId)
            .remove(userId);

        if (team.users.length <= 1)
            return this.deleteTeam(teamId);

    }

    getTeamCountForEvent(eventId: string): Promise<number> {
        return this.teamRepository.count({
            where: {
                event: {
                    id: eventId
                }
            }
        });
    }

    existsTeamByName(name: string, eventId: string): Promise<boolean> {
        return this.teamRepository.exists({
            where: {
                name,
                event: {
                    id: eventId
                }
            }
        });
    }

    getTeamsUserIsInvitedTo(userId: string, eventId: string): Promise<TeamEntity[]> {
        return this.teamRepository.find({
            where: {
                event: {
                    id: eventId
                },
                teamInvites: {
                    id: userId
                }
            }
        });
    }

    isUserInvitedToTeam(userId: string, teamId: string): Promise<boolean> {
        return this.teamRepository.exists({
            where: {
                id: teamId,
                teamInvites: {
                    id: userId
                }
            }
        });
    }

    async acceptTeamInvite(userId: string, teamId: string): Promise<void> {
        const team = await this.getTeamById(teamId, {
            event: true
        })
        const user = await this.userService.getUserById(userId);

        await this.githubApiService.addUserToRepository(team.repo, user.username, team.event.githubOrg, team.event.githubOrgSecret, user.githubAccessToken);

        await this.teamRepository.createQueryBuilder()
            .relation("teamInvites")
            .of(teamId)
            .remove(userId);

        await this.teamRepository.createQueryBuilder()
            .relation("users")
            .of(teamId)
            .add(userId);
    }

    declineTeamInvite(userId: string, teamId: string) {
        return this.teamRepository.createQueryBuilder()
            .relation("teamInvites")
            .of(teamId)
            .remove(userId);
    }

    async getTeamsForEvent(eventId: string, searchName?: string, searchDir?: string, sortBy?: string): Promise<Array<TeamEntity & {
        userCount: number
    }>> {
        const query = this.teamRepository.createQueryBuilder('team')
            .innerJoin('team.event', 'event')
            .leftJoin('team.users', 'user')
            .where('event.id = :eventId', {eventId})
            .select([
                'team.id',
                'team.name',
                'team.locked',
                'team.repo',
                'team.createdAt',
                'team.updatedAt',
            ])
            .addSelect('COUNT(user.id)', 'userCount')
            .groupBy('team.id');

        if (searchName) {
            query.andWhere('team.name LIKE :searchName', {searchName: `%${searchName}%`});
        }

        if (sortBy) {
            const direction = searchDir?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            query.orderBy(`team.${sortBy}`, direction as 'ASC' | 'DESC');
        }

        const result = await query.getRawAndEntities();
        return result.entities.map((team, idx) => ({
            ...team,
            userCount: parseInt(result.raw[idx].userCount, 10)
        }));
    }
}
