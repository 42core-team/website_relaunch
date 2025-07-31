import { Module } from '@nestjs/common';
import {MatchEntity} from "./entites/match.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import { MatchService } from './match.service';
import {TeamModule} from "../team/team.module";
import {EventModule} from "../event/event.module";
import { MatchController } from './match.controller';

@Module({
    imports: [TypeOrmModule.forFeature([MatchEntity]), TeamModule, EventModule],
    controllers: [MatchController],
    providers: [MatchService],
    exports: []
})
export class MatchModule {}
