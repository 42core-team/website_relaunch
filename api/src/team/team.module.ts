import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {TeamEntity} from "./entities/team.entity";
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import {GithubApiModule} from "../github-api/github-api.module";

@Module({
    imports: [TypeOrmModule.forFeature([TeamEntity]), GithubApiModule],
    controllers: [TeamController],
    providers: [TeamService],
    exports: [TeamService]
})
export class TeamModule {}
