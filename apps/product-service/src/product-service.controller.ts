import { Controller, Get } from '@nestjs/common';
import { ProductServiceService } from './product-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class ProductServiceController {
  constructor(private readonly productServiceService: ProductServiceService) {}

  @MessagePattern('get_products')
  async getProductsData(@Payload() data: { page: number; limit: number }) {
    return await this.productServiceService.getProducts(data?.page, data.limit);
  }

  @MessagePattern('get_categories')
  async getCategories() {
    return await this.productServiceService.getCategories();
  }

  @MessagePattern('get_product_details')
  async getProductDetails(@Payload() data: { id: string }) {
    return await this.productServiceService.getProductDetails(data?.id);
  }
}
