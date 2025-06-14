import {IsNotEmpty, IsUUID} from "class-validator";

export class InviteUserDto{
    @IsUUID()
    @IsNotEmpty()
    userToInviteId: string;
}