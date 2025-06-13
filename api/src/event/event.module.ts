import { Module } from '@nestjs/common';
import {EventEntity} from "./entities/event.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
    imports: [TypeOrmModule.forFeature([EventEntity])],
    controllers: [EventController],
    providers: [EventService],
    exports: []
})
export class EventModule {}
