import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class WishListGatewayService {
  constructor(
    @Inject('PRODUCT_SERVICE')
    private readonly productClient: ClientProxy,
  ) {}
  async addToWishList(data: any) {
    return await this.productClient.send('add_to_wishlist', data);
  }

  async getWishlist(userId: string) {
    return await this.productClient.send('get_wishlist', userId);
  }
}
