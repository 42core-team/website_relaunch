import { Module } from '@nestjs/common';
import {EventEntity} from "./entities/event.entity";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([EventEntity])],
    controllers: [],
    providers: [],
    exports: []
})
export class EventModule {}
