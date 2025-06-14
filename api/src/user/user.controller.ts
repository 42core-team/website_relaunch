import {Body, Controller, Get, Param, Post, Put, UseGuards} from '@nestjs/common';
import {UserService} from "./user.service";
import {CreateUserDto} from "./dtos/user.dto";
import {FrontendGuard, UserId} from "../guards/FrontendGuard";

@UseGuards(FrontendGuard)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @Post()
    async createUser(@Body() user: CreateUserDto) {
        return this.userService.createUser(
            user.email,
            user.username,
            user.name,
            user.profilePicture,
            user.githubId,
            user.githubAccessToken,
            user.canCreateEvent
        );
    }

    @Put(":id")
    async updateUser(
        @Body() user: CreateUserDto,
        @Param('id') id: string
    ) {
        return this.userService.updateUser(
            id,
            user.email,
            user.username,
            user.name,
            user.profilePicture,
            user.githubId,
            user.githubAccessToken,
            user.canCreateEvent
        );
    }

    @Get("canCreateEvent")
    async canCreateEvent(@UserId('id') id: string) {
        return this.userService.canCreateEvent(id);
    }

    @Get("github/:githubId")
    async getUserByGithubId(@Param('githubId') githubId: string) {
        return this.userService.getUserByGithubId(githubId);
    }

    @Get("email/:email")
    async getUserByEmail(@Param('email') email: string) {
        return this.userService.getUserByEmail(email);
    }
}
