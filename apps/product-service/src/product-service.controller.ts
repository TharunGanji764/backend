import { Controller, Get } from '@nestjs/common';
import { ProductServiceService } from './product-service.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class ProductServiceController {
  constructor(private readonly productServiceService: ProductServiceService) {}

  @Get()
  getHello(): string {
    return this.productServiceService.getHello();
  }

  @EventPattern('get_products')
  async getProductsData() {
    return await this.productServiceService.getProducts();
  }
}
