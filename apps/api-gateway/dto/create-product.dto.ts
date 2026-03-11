import { IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  product_name: string;
  @IsString()
  category: string;
  @IsString()
  short_description: string;
  @IsString()
  full_description: string;
  @IsString()
  brand: string;
}
