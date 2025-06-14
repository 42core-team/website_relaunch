import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {TeamEntity} from "./entities/team.entity";
import {Repository} from "typeorm";
import {GithubApiService} from "../github-api/github-api.service";

@Injectable()
export class TeamService {
    constructor(
        @InjectRepository(TeamEntity)
        private readonly teamRepository: Repository<TeamEntity>,
        private readonly githubApiService: GithubApiService
    ) {
    }

    logger = new Logger("TeamService");

    getTeamById(id: string): Promise<TeamEntity | null> {
        return this.teamRepository.findOneBy({
            id
        })
    }

    getTeamOfUserForEvent(eventId: string, userId: string): Promise<TeamEntity | null> {
        return this.teamRepository.findOne({
            where: {
                event: {
                    id: eventId
                },
                users: {
                    id: userId
                }
            }
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

    getTeamCountForEvent(eventId: string): Promise<number> {
        return this.teamRepository.count({
            where: {
                event: {
                    id: eventId
                }
            }
        });
    }
}
