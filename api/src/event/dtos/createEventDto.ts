import {IsString, IsOptional, IsNumber, MinLength, Min, IsNotEmpty} from "class-validator";

export class CreateEventDto {
    @IsString()
    @MinLength(3)
    name: string;

    @IsOptional()
    @IsString()
    description: string;


    @IsString()
    @IsNotEmpty()
    githubOrg: string;

    @IsString()
    @IsNotEmpty()
    githubOrgSecret: string;

    @IsOptional()
    @IsString()
    location: string;

    @IsNumber()
    startDate: number;

    @IsNumber()
    endDate: number;

    @IsNumber()
    @Min(1)
    minTeamSize: number;

    @IsNumber()
    @Min(1)
    maxTeamSize: number;

    @IsOptional()
    @IsNumber()
    treeFormat?: number;

    @IsOptional()
    @IsString()
    repoTemplateOwner?: string;

    @IsOptional()
    @IsString()
    repoTemplateName?: string;
}