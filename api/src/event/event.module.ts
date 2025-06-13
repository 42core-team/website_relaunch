import {Module} from '@nestjs/common';
import {EventEntity} from "./entities/event.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {EventController} from './event.controller';
import {EventService} from './event.service';
import {TeamModule} from "../team/team.module";

@Module({
    imports: [TypeOrmModule.forFeature([EventEntity]), TeamModule],
    controllers: [EventController],
    providers: [EventService],
    exports: []
})
export class EventModule {
}
