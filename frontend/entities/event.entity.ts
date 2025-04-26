import {Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {TeamEntity} from "./team.entity";
import { UserEntity } from "./users.entity";
import { UserEventPermissionEntity } from "./user-event-permission.entity";
import { EventType } from "@/entities/eventTypes";
import {EventState} from "@/entities/eventState";

@Entity('events')
export class EventEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({default: ""})
    description: string;

    @Column({type: "enum", enum: EventType, default: EventType.REGULAR})
    type: EventType;

    @Column({ nullable: true })
    repoTemplateOwner: string;
    
    @Column({ nullable: true })
    repoTemplateName: string;

    @Column({default: ""})
    location: string

    @Column()
    minTeamSize: number;

    @Column()
    maxTeamSize: number;

    @Column({default: 16})
    treeFormat: number;

    @Column({type: "timestamp"})
    startDate: Date;

    @Column({type: "timestamp"})
    endDate: Date;

    @Column({type: "enum", enum: EventState, default: EventState.TEAM_FINDING})
    state: EventState;

    @Column({default: 0})
    currentRound: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @JoinTable({name: 'events_users'})
    @ManyToMany(() => UserEntity, user => user.events)
    users: UserEntity[];

    @OneToMany(() => TeamEntity, team => team.event, {onDelete: "CASCADE"})
    teams: TeamEntity[];

    @OneToMany(() => UserEventPermissionEntity, permission => permission.event)
    permissions: UserEventPermissionEntity[];
}