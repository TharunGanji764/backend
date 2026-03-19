import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateProductDto } from 'apps/api-gateway/dto/create-product.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SellerGatewayService {
  constructor(
    @Inject('PRODUCT_SERVICE')
    private readonly productClient: ClientProxy,
  ) {}

  async createProduct({
    productData,
    userId,
  }: {
    productData: CreateProductDto;
    userId: string;
  }) {
    return await firstValueFrom(
      this.productClient.send('create-product', { productData, userId }),
    );
  }

  async addProductVariants(productData: any) {
    return await firstValueFrom(
      this.productClient.send('create-product-variants', productData),
    );
  }
  async updateProductVariants(productData: any) {
    return await firstValueFrom(
      this.productClient.send('update-product-variants', productData),
    );
  }
  async deleteProductAttributes(productData: any) {
    return await firstValueFrom(
      this.productClient.send('delete-product-attributes', productData),
    );
  }
  async getSellerProducts(sellerId: any) {
    return await firstValueFrom(
      this.productClient.send('get-seller-product', { sellerId }),
    );
  }
}
