import { Controller } from '@nestjs/common';
import { CartServiceService } from './cart-service.service';
import {
  ClientProxy,
  MessagePattern,
  Payload,
  RpcException,
} from '@nestjs/microservices';

@Controller()
export class CartServiceController {
  constructor(private readonly cartServiceService: CartServiceService) {}

  @MessagePattern('get_CartData')
  async getCartItems(@Payload() data: { user: any }) {
    return await this.cartServiceService.getCartItems(data?.user);
  }

  @MessagePattern('add_to_cart')
  async addToCart(@Payload() data: { itemData: any; user: any }) {
    return await this.cartServiceService.addToCart(data?.itemData, data?.user);
  }

  @MessagePattern('edit_cart')
  async editCart(@Payload() payload: any) {
    const { action, productId } = payload;
    if (action === undefined || !productId) {
      throw new RpcException({
        status: 400,
        message: 'Invalid edit cart payload',
      });
    }
    return await this.cartServiceService.editCart(action, productId);
  }

  @MessagePattern('remove_from_cart')
  async removeFromCart(@Payload() payload: any) {
    const { productId } = payload;
    return await this.cartServiceService.removeFromCart(productId);
  }

  @MessagePattern('clear_cart')
  async clearCart(@Payload() payload: any) {
    const { userId } = payload;
    return await this.cartServiceService.clearCart(userId);
  }
}
