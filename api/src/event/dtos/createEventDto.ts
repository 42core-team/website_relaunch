import {
  IsString,
  IsOptional,
  IsNumber,
  MinLength,
  Min,
  IsNotEmpty,
  IsBoolean,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  githubOrg: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  githubOrgSecret: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  location: string;

  @ApiProperty()
  @IsNumber()
  startDate: number;

  @ApiProperty()
  @IsNumber()
  endDate: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  minTeamSize: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  maxTeamSize: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  repoTemplateOwner?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  repoTemplateName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  gameServerDockerImage?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  myCoreBotDockerImage?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  visualizerDockerImage?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  monorepoUrl?: string;

  @ApiProperty()
  @IsBoolean()
  isPrivate: boolean;
}
