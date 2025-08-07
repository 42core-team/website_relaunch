import {IsDateString, IsOptional} from "class-validator";

export class SetLockTeamsDateDto{
    @IsDateString()
    @IsOptional()
    repoLockDate: string;
}