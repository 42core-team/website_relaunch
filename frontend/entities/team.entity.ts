import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {EventEntity} from "@/entities/event.entity";
import {MatchEntity} from "@/entities/match.entity";
import {UserEntity} from "@/entities/users.entity";

@Entity("teams")
export class TeamEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({default: false})
    locked: boolean;

    @Column({nullable: true})
    repo: string

    @Column({default: 0})
    score: number

    @ManyToOne(() => EventEntity, event => event.teams)
    event: EventEntity

    @JoinTable()
    @ManyToMany(() => UserEntity, user => user.teams)
    users: UserEntity[]

    @ManyToMany(() => MatchEntity, match => match.teams)
    matches: MatchEntity[]

    @JoinTable()
    @ManyToMany(() => UserEntity, user => user.teamInvites)
    teamInvites: UserEntity[]

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}