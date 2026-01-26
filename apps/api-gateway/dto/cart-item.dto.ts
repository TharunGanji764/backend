import { IsNumber, IsString } from 'class-validator';

export class CartItemDto {
  @IsString()
  product_id: string;

  @IsNumber()
  quantity: number;
}
