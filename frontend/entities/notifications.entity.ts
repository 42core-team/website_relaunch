import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import type {UserEntity} from "@/entities/users.entity";

@Entity("notifications")
export class NotificationEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column({default: ""})
    description: string;

    @Column({default: false})
    read: boolean;

    @ManyToOne("UserEntity", "notifications", {onDelete: "CASCADE"})
    user: UserEntity;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}