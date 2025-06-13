import {IsString, IsOptional, IsNumber, MinLength, IsDateString, Min, IsEnum} from "class-validator";
import {EventType} from "../entities/event.entity";

export class CreateEventDto {
    @IsString()
    @MinLength(3)
    name: string;

    @IsOptional()
    @IsString()
    description: string;

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

    @IsEnum(EventType)
    type: EventType;

    @IsOptional()
    @IsString()
    repoTemplateOwner?: string;

    @IsOptional()
    @IsString()
    repoTemplateName?: string;
}