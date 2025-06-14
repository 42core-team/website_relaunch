import {IsNotEmpty, IsString, Matches} from "class-validator";

export class CreateTeamDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9]([a-zA-Z0-9-_]*[a-zA-Z0-9])?$/, {
        message: 'Name can only contain letters, numbers, hyphens and underscores, and cannot start or end with hyphens or underscores'
    })
    name: string
}