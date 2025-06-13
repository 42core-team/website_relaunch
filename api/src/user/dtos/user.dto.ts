import {IsBoolean, IsEmail, IsNotEmpty, IsString} from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  username: string;
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsString()
  profilePicture: string;

  @IsNotEmpty()
  @IsString()
  githubId: string;

  @IsNotEmpty()
  @IsString()
  githubAccessToken: string;

  @IsBoolean()
  canCreateEvent?: boolean;
}