import { IsBoolean, IsString, Length } from 'class-validator';

export class AddressDto {
  @IsString()
  address_line: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  @Length(6, 6, { message: 'Pincode must be 6 characters long' })
  pincode: number;

  @IsBoolean()
  is_default: boolean;

  @IsString()
  full_name: string;

  @IsString()
  phone_number: string;

  @IsString()
  landmark: string;

  @IsString()
  tag: string;
}
