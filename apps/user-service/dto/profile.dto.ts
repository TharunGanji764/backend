import { IsEmail, IsString } from 'class-validator';

export class ProfileDTO {
  @IsEmail()
  emailId: string;

  @IsString()
  username: string;

  @IsString()
  mobile: string;

  @IsString()
  userid: string;
}
