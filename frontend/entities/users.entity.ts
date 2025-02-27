import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany} from "typeorm";
import {TeamEntity} from "@/entities/team.entity";

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
}