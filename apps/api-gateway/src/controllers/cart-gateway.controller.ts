import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'apps/api-gateway/lib/authguard';
import { User } from '../decorators/user.decorator';
import { CartGatewayService } from '../services/cart-gateway.service';
import { CartItemDto } from 'apps/api-gateway/dto/cart-item.dto';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartGatewayService: CartGatewayService) {}
  @Get()
  async getCartList(@User() user: any) {
    return await this.cartGatewayService.getCartList(user);
  }

  @Post('/add-to-cart')
  async addToCart(@User() user: any, @Body() productData: CartItemDto) {
    return await this.cartGatewayService.addToCartItems(user, productData);
  }

  @Put('/items')
  async editCart(
    @Query('productId') productId: string,
    @Body('action') action: string,
  ) {
    return await this.cartGatewayService.editCart(action, productId);
  }

  @Delete('/items')
  async removeFromCart(@Query('productId') productId: string) {
    return await this.cartGatewayService.removeFromCart(productId);
  }

  @Delete('')
  async clearCart(@User() user: any) {
    const { sub } = user;
    return await this.cartGatewayService.clearCart(sub);
  }
}
