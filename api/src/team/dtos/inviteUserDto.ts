import {IsNotEmpty, IsUUID} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class InviteUserDto{
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    userToInviteId: string;
}