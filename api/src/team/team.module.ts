import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {TeamEntity} from "./entities/team.entity";

@Module({
    imports: [TypeOrmModule.forFeature([TeamEntity])],
    controllers: [],
    providers: [],
    exports: []
})
export class TeamModule {}
