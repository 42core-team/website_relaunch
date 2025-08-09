import {forwardRef, Module} from '@nestjs/common';
import {MatchEntity} from "./entites/match.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {MatchService} from './match.service';
import {TeamModule} from "../team/team.module";
import {EventModule} from "../event/event.module";
import {MatchController} from './match.controller';
import {ClientsModule, Transport} from "@nestjs/microservices";
import {GithubApiModule} from "../github-api/github-api.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([MatchEntity]),
        forwardRef(() => TeamModule),
        forwardRef(() => EventModule),
        forwardRef(() => GithubApiModule)
    ],
    controllers: [MatchController],
    providers: [MatchService],
    exports: [MatchService]
})
export class MatchModule {
}
