import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {TeamEntity} from "./team.entity";

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

    @OneToMany(() => TeamEntity, team => team.event, {onDelete: "CASCADE"})
    teams: TeamEntity[]
}