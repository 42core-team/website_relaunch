import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, OneToMany, UpdateDateColumn} from "typeorm";
import {TeamEntity} from "@/entities/team.entity";
import type {NotificationEntity} from "@/entities/notifications.entity";
import { EventEntity } from "./event.entity";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    githubId: string;

    @Column()
    githubAccessToken: string;

    @Column()
    email: string;

    @Column()
    username: string;

    @Column()
    name: string;

    @Column({nullable: true})
    profilePicture: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToMany(() => TeamEntity, team => team.users)
    teams: TeamEntity[]

    @ManyToMany(() => TeamEntity, team => team.teamInvites)
    teamInvites: TeamEntity[]

    @ManyToMany(() => EventEntity, event => event.users)
    events: EventEntity[]

    @OneToMany("NotificationEntity", "user")
    notifications: NotificationEntity[]
}