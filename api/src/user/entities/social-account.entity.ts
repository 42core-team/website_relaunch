import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from "typeorm";
import { UserEntity } from "./user.entity";

export enum SocialPlatform {
  FORTYTWO = "42",
}

@Entity("social_accounts")
@Unique(["userId", "platform"]) // Ensure one account per platform per user
export class SocialAccountEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: SocialPlatform })
  platform: SocialPlatform;

  @Column()
  username: string; // Username from the social platform

  @Column()
  platformUserId: string; // User ID from the social platform

  @Column()
  userId: string; // Reference to our user

  @ManyToOne(() => UserEntity, (user) => user.socialAccounts, {
    onDelete: "CASCADE",
  })
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
