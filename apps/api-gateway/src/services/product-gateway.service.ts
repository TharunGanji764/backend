import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProductGatewayService {
  constructor(
    @Inject('PRODUCT_SERVICE')
    private readonly productClient: ClientProxy,
  ) {}

  async getProducts() {
    return await this.productClient.send('get_products', {});
  }
}
