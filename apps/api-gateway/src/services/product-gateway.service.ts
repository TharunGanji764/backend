import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProductGatewayService {
  constructor(
    @Inject('PRODUCT_SERVICE')
    private readonly productClient: ClientProxy,
  ) {}

  async getProducts(page: number, limit: number) {
    return await this.productClient.send('get_products', { page, limit });
  }

  async getCategories() {
    return await this.productClient.send('get_categories', {});
  }

  async getProductDetails(id: string) {
    return await this.productClient.send('get_product_details', { id });
  }
}
