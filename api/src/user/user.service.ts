import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {Like, Repository, UpdateResult} from "typeorm";

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
            canCreateEvent: canCreateEvent ?? false
        })
    }

    getUserCountOfEvent(eventId: string): Promise<number> {
        return this.userRepository.count({
            where: {
                events: {
                    id: eventId
                }
            }
        });
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

    joinEvent(userId: string, eventId: string) {
        return this.userRepository
            .createQueryBuilder()
            .relation(UserEntity, "events")
            .of(userId)
            .add(eventId)
    }

    canCreateEvent(userId: string): Promise<boolean> {
        return this.userRepository.existsBy({
            id: userId,
            canCreateEvent: true
        });
    }

    getUserById(userId: string) {
        return this.userRepository.findOneByOrFail({
            id: userId
        })
    }

    addTeamInvite(userId: string, teamId: string): Promise<void> {
        return this.userRepository
            .createQueryBuilder()
            .relation(UserEntity, "teamInvites")
            .of(userId)
            .add(teamId);
    }

    searchUsersForInvite(eventId: string, searchQuery: string, id: string) {
        return this.userRepository
            .createQueryBuilder('user')
            .innerJoin('user.events', 'event', 'event.id = :eventId', {eventId})
            .leftJoin('user.teams', 'team')
            .leftJoin('team.event', 'teamEvent', 'teamEvent.id = :eventId', {eventId})
            .where('LOWER(user.username) LIKE LOWER(:username)', {username: `%${searchQuery}%`})
            .orWhere('LOWER(user.name) LIKE LOWER(:name)', {name: `%${searchQuery}%`})
            .andWhere('team.id IS NULL')
            .getMany();
    }
}
