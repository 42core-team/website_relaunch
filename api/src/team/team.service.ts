import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {TeamEntity} from "./entities/team.entity";
import {Repository} from "typeorm";

@Injectable()
export class TeamService {
    constructor(
        @InjectRepository(TeamEntity)
        private readonly teamRepository: Repository<TeamEntity>
    ) {
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
