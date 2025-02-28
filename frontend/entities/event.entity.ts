import {Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {TeamEntity} from "./team.entity";
import { UserEntity } from "./users.entity";

@Entity('events')
export class EventEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({default: ""})
    description: string;

    @Column({default: ""})
    location: string

    @Column()
    minTeamSize: number;

    @Column()
    maxTeamSize: number;

    @Column({type: "timestamp"})
    startDate: Date;

    @Column({type: "timestamp"})
    endDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @JoinTable()
    @ManyToMany(() => UserEntity, user => user.events)
    users: UserEntity[];

    @OneToMany(() => TeamEntity, team => team.event, {onDelete: "CASCADE"})
    teams: TeamEntity[];
}