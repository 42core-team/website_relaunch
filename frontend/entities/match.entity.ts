import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable, ManyToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {TeamEntity} from "@/entities/team.entity";

export enum MatchState {
    PLANNED = "PLANNED",
    READY = "READY", // In progress?
    FINISHED = "FINISHED"
}

export enum MatchPhase {
    SWISS = "SWISS",
    ELIMINATION = "ELIMINATION"
}

@Entity("matches")
export class MatchEntity{
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "enum", enum: MatchState})
    state: MatchState;

    @Column()
    round: number;

    @JoinColumn()
    @OneToOne(() => TeamEntity)
    winner: TeamEntity;

    @Column({type: "enum", enum: MatchPhase, default: MatchPhase.SWISS})
    phase: MatchPhase;

    @ManyToMany(() => TeamEntity, team => team.matches)
    @JoinTable({name: 'matches_teams'})
    teams: TeamEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}