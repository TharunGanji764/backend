import { Controller, Get } from '@nestjs/common';
import { ProductServiceService } from './product-service.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class ProductServiceController {
  constructor(private readonly productServiceService: ProductServiceService) {}


  @EventPattern('get_products')
  async getProductsData() {
    return await this.productServiceService.getProducts();
  }
}
