import { IsEmail, IsString } from 'class-validator';

export class LoginDTO {
  @IsEmail()
  emailId: string;

  @IsString()
  password: string;
}
