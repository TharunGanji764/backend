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

  async createProduct({ productData, userId }: { productData: CreateProductDto; userId: string }) {
    // Logic to create a product
    return await firstValueFrom(this.productClient.send('create-product', { productData, userId }));
  }
}
