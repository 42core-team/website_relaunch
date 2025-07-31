import { IsNotEmpty, IsString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTeamDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]([a-zA-Z0-9-_]*[a-zA-Z0-9])?$/, {
    message:
      "Name can only contain letters, numbers, hyphens and underscores, and cannot start or end with hyphens or underscores",
  })
  name: string;
}
