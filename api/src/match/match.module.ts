import { Module } from '@nestjs/common';
import {MatchEntity} from "./entites/match.entity";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([MatchEntity])],
    controllers: [],
    providers: [],
    exports: []
})
export class MatchModule {}
