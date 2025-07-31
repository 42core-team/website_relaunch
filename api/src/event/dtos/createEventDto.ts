import {
  IsString,
  IsOptional,
  IsNumber,
  MinLength,
  Min,
  IsNotEmpty,
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
  @IsNumber()
  treeFormat?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  repoTemplateOwner?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  repoTemplateName?: string;
}
