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
import {UserEntity} from "@/entities/users.entity";
import {MatchEntity} from "@/entities/match.entity";

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

    @ManyToOne(() => EventEntity, event => event.teams)
    event: Event

    @JoinTable()
    @ManyToMany(() => UserEntity, user => user.teams)
    users: UserEntity[]

    @ManyToMany(() => MatchEntity, match => match.teams)
    matches: MatchEntity[]

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}