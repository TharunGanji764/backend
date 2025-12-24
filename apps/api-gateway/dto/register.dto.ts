import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

export class RegisterDTO {
  @IsEmail()
  emailId: string;

  @IsString()
  @Length(10, 10)
  @Matches(/^[0-9]+$/, { message: 'mobile must contain only digits' })
  mobile: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  username: string;
}
