import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import type { UserEntity } from "./users.entity";
import type { EventEntity } from "./event.entity";

export enum PermissionRole {
	USER = "USER",
	ADMIN = "ADMIN"
}

@Entity('user_event_permissions')
export class UserEventPermissionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column({type: "enum", enum: PermissionRole, default: PermissionRole.USER})
    role: PermissionRole;

	@ManyToOne('UserEntity', (user: UserEntity) => user.permissions, {onDelete: "CASCADE"})
    user: UserEntity;

    @ManyToOne('EventEntity', (event: EventEntity) => event.permissions, {onDelete: "CASCADE"})
    event: EventEntity;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
}

