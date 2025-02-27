import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable, ManyToMany, OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {TeamEntity} from "@/entities/team.entity";

export enum MatchState{
    PLANNED = "PLANNED",
    READY = "READY",
    FINISHED = "FINISHED"
}

@Entity("matches")
export class MatchEntity{
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "enum", enum: MatchState})
    state: MatchState;

    @JoinColumn()
    @OneToOne(() => TeamEntity)
    winner: TeamEntity;

    @ManyToMany(() => TeamEntity, team => team.matches)
    @JoinTable()
    teams: TeamEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}