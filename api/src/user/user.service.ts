import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {Repository, UpdateResult} from "typeorm";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {
    }

    async createUser(
        email: string,
        username: string,
        name: string,
        profilePicture: string,
        githubId: string,
        githubAccessToken: string,
        canCreateEvent?: boolean
    ): Promise<UserEntity> {
        const newUser = this.userRepository.create({
            email,
            username,
            name,
            profilePicture,
            githubId,
            githubAccessToken,
            canCreateEvent
        });
        return this.userRepository.save(newUser);
    }

    async updateUser(
        id: string,
        email: string,
        username: string,
        name: string,
        profilePicture: string,
        githubId: string,
        githubAccessToken: string,
        canCreateEvent?: boolean
    ): Promise<UpdateResult> {
        return this.userRepository.update(id, {
            email,
            username,
            name,
            profilePicture,
            githubId,
            githubAccessToken,
            canCreateEvent
        })
    }

    getUserByGithubId(githubId: string) {
        return this.userRepository.findOneBy({
            githubId
        })
    }

    getUserByEmail(email: string) {
        return this.userRepository.findOneBy({
            email
        })
    }
}
