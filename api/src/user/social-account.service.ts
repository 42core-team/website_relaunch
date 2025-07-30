import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialAccountEntity, SocialPlatform } from './entities/social-account.entity';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class SocialAccountService {
    constructor(
        @InjectRepository(SocialAccountEntity)
        private socialAccountRepository: Repository<SocialAccountEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ) {}

    async linkSocialAccount(
        userId: string,
        platform: SocialPlatform,
        username: string,
        platformUserId: string
    ): Promise<SocialAccountEntity> {
        // Check if user exists
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if this platform account is already linked to another user
        const existingAccount = await this.socialAccountRepository.findOne({
            where: { platform, platformUserId }
        });

        if (existingAccount && existingAccount.userId !== userId) {
            throw new ConflictException('This social account is already linked to another user');
        }

        // Check if user already has an account for this platform
        const existingUserAccount = await this.socialAccountRepository.findOne({
            where: { userId, platform }
        });

        if (existingUserAccount) {
            // Update existing account
            existingUserAccount.username = username;
            existingUserAccount.platformUserId = platformUserId;
            return await this.socialAccountRepository.save(existingUserAccount);
        }

        // Create new social account link
        const socialAccount = this.socialAccountRepository.create({
            userId,
            platform,
            username,
            platformUserId
        });

        return await this.socialAccountRepository.save(socialAccount);
    }

    async unlinkSocialAccount(userId: string, platform: SocialPlatform): Promise<void> {
        const result = await this.socialAccountRepository.delete({ userId, platform });
        
        if (result.affected === 0) {
            throw new NotFoundException('Social account link not found');
        }
    }

    async getSocialAccounts(userId: string): Promise<SocialAccountEntity[]> {
        return await this.socialAccountRepository.find({
            where: { userId },
            order: { createdAt: 'ASC' }
        });
    }

    async getSocialAccountByPlatform(userId: string, platform: SocialPlatform): Promise<SocialAccountEntity | null> {
        return await this.socialAccountRepository.findOne({
            where: { userId, platform }
        });
    }
}