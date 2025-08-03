import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany, ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { TeamEntity } from "../../team/entities/team.entity";

export enum MatchState {
  PLANNED = "PLANNED",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

export enum MatchPhase {
  SWISS = "SWISS",
  ELIMINATION = "ELIMINATION",
}

@Entity("matches")
export class MatchEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: MatchState })
  state: MatchState;

  @Column()
  round: number;

  @ManyToOne(() => TeamEntity)
  winner: TeamEntity;

  @Column({ type: "enum", enum: MatchPhase, default: MatchPhase.SWISS })
  phase: MatchPhase;

  @ManyToMany(() => TeamEntity, (team) => team.matches)
  @JoinTable({ name: "matches_teams" })
  teams: TeamEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
