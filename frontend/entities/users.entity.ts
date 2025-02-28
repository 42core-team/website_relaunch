import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, OneToMany} from "typeorm";
import {TeamEntity} from "@/entities/team.entity";
import type {NotificationEntity} from "@/entities/notifications.entity";
import { EventEntity } from "./event.entity";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column()
    username: string;

    @Column()
    name: string;

    @Column()
    profilePicture: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToMany(() => TeamEntity, team => team.users)
    teams: TeamEntity[]

    @ManyToMany(() => TeamEntity, team => team.teamInvites)
    teamInvites: TeamEntity[]

    @ManyToMany(() => EventEntity, event => event.users)
    events: EventEntity[]

    @OneToMany("NotificationEntity", "user")
    notifications: NotificationEntity[]
}