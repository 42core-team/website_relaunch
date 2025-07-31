import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SocialAccountService } from "./social-account.service";
import {
  SocialAccountEntity,
  SocialPlatform,
} from "./entities/social-account.entity";
import { FrontendGuard } from "src/guards/FrontendGuard";

class LinkSocialAccountDto {
  userId: string;
  platform: SocialPlatform;
  username: string;
  platformUserId: string;
}

@UseGuards(FrontendGuard)
@ApiTags("social-accounts")
@Controller("social-accounts")
export class SocialAccountController {
  constructor(private readonly socialAccountService: SocialAccountService) {}

  @Post("link")
  @ApiOperation({ summary: "Link a social account to a user" })
  @ApiResponse({
    status: 200,
    description: "Social account linked successfully",
  })
  @ApiResponse({
    status: 409,
    description: "Social account already linked to another user",
  })
  async linkSocialAccount(
    @Body() linkDto: LinkSocialAccountDto,
  ): Promise<SocialAccountEntity> {
    return await this.socialAccountService.linkSocialAccount(
      linkDto.userId,
      linkDto.platform,
      linkDto.username,
      linkDto.platformUserId,
    );
  }

  @Delete(":userId/:platform")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Unlink a social account from a user" })
  @ApiResponse({
    status: 200,
    description: "Social account unlinked successfully",
  })
  @ApiResponse({ status: 404, description: "Social account link not found" })
  async unlinkSocialAccount(
    @Param("userId") userId: string,
    @Param("platform") platform: SocialPlatform,
  ): Promise<void> {
    await this.socialAccountService.unlinkSocialAccount(userId, platform);
  }

  @Get(":userId")
  @ApiOperation({ summary: "Get all social accounts for a user" })
  @ApiResponse({
    status: 200,
    description: "Social accounts retrieved successfully",
  })
  async getSocialAccounts(
    @Param("userId") userId: string,
  ): Promise<SocialAccountEntity[]> {
    return await this.socialAccountService.getSocialAccounts(userId);
  }

  @Get(":userId/:platform")
  @ApiOperation({ summary: "Get a specific social account for a user" })
  @ApiResponse({
    status: 200,
    description: "Social account retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "Social account not found" })
  async getSocialAccountByPlatform(
    @Param("userId") userId: string,
    @Param("platform") platform: SocialPlatform,
  ): Promise<SocialAccountEntity | null> {
    return await this.socialAccountService.getSocialAccountByPlatform(
      userId,
      platform,
    );
  }
}
