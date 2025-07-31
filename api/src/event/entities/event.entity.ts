import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  UserEntity,
  UserEventPermissionEntity,
} from "../../user/entities/user.entity";
import { TeamEntity } from "../../team/entities/team.entity";
import { Exclude } from "class-transformer";

export enum EventState {
  TEAM_FINDING = "TEAM_FINDING",
  CODING_PHASE = "CODING_PHASE",
  SWISS_ROUND = "SWISS_ROUND",
  ELIMINATION_ROUND = "ELIMINATION_ROUND",
  FINISHED = "FINISHED",
}

@Entity("events")
export class EventEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ default: "" })
  description: string;

  @Column()
  githubOrg: string;

  @Exclude()
  @Column()
  githubOrgSecret: string;

  @Column({ nullable: true })
  repoTemplateOwner: string;

  @Column({ nullable: true })
  repoTemplateName: string;

  @Column({ default: "" })
  location: string;

  @Column()
  minTeamSize: number;

  @Column()
  maxTeamSize: number;

  @Column({ default: 16 })
  treeFormat: number;

  @Column({ type: "timestamp" })
  startDate: Date;

  @Column({ type: "timestamp" })
  endDate: Date;

  @Column({ type: "enum", enum: EventState, default: EventState.TEAM_FINDING })
  state: EventState;

  @Column({ default: 0 })
  currentRound: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @JoinTable({ name: "events_users" })
  @ManyToMany(() => UserEntity, (user) => user.events)
  users: UserEntity[];

  @OneToMany(() => TeamEntity, (team) => team.event, { onDelete: "CASCADE" })
  teams: TeamEntity[];

  @OneToMany(
    () => UserEventPermissionEntity,
    (permission) => permission.event,
    {
      onUpdate: "CASCADE",
      cascade: true,
    },
  )
  permissions: UserEventPermissionEntity[];
}
