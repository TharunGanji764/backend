import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CartItemDto } from 'apps/api-gateway/dto/cart-item.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CartGatewayService {
  constructor(
    @Inject('CART_SERVICE')
    private readonly cartServiceClient: ClientProxy,
  ) {}

  async getCartList(user: any) {
    return await firstValueFrom(
      this.cartServiceClient.send('get_CartData', { user }),
    );
  }

  async addToCartItems(user: any, itemData: CartItemDto) {
    return await firstValueFrom(
      this.cartServiceClient.send('add_to_cart', { user, itemData }),
    );
  }

  async editCart(action: string, productId: string) {
    return await firstValueFrom(
      this.cartServiceClient.send('edit_cart', { action, productId }),
    );
  }

  async removeFromCart(productId: string) {
    return await firstValueFrom(
      this.cartServiceClient.send('remove_from_cart', { productId }),
    );
  }

  async clearCart(userId: string) {
    return await firstValueFrom(
      this.cartServiceClient.send('clear_cart', { userId }),
    );
  }
}
