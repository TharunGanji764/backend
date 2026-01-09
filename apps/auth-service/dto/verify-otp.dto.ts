import { IsEmail, IsString } from 'class-validator';

export class verifyOtpDTO {
  @IsEmail()
  emailId: string;

  @IsString()
  otp: string;
}
