import {Module} from '@nestjs/common';
import {UserController} from './user.controller';
import {UserService} from './user.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity, UserEventPermissionEntity} from "./entities/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, UserEventPermissionEntity])],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]

})
export class UserModule {
}
