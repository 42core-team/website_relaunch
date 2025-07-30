-- Migration: Add Social Accounts Table
-- This migration creates the social_accounts table for linking users with external platforms

CREATE TYPE social_platform AS ENUM ('github', '42', 'discord', 'twitter', 'linkedin');

CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform social_platform NOT NULL,
    username VARCHAR NOT NULL,
    "platformUserId" VARCHAR NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_social_accounts_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint to ensure one account per platform per user
    CONSTRAINT uq_social_accounts_user_platform UNIQUE ("userId", platform),
    
    -- Unique constraint to ensure one platform account can only be linked to one user
    CONSTRAINT uq_social_accounts_platform_user UNIQUE (platform, "platformUserId")
);

-- Create indexes for better query performance
CREATE INDEX idx_social_accounts_user_id ON social_accounts ("userId");
CREATE INDEX idx_social_accounts_platform ON social_accounts (platform);
CREATE INDEX idx_social_accounts_platform_user_id ON social_accounts (platform, "platformUserId");