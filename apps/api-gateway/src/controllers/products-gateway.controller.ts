import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductGatewayService } from '../services/product-gateway.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productGatewayService: ProductGatewayService) {}

  @Get('/')
  async getProductsData(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.productGatewayService.getProducts(page, limit);
  }

  @Get('/categories')
  async getCategories() {
    return await this.productGatewayService.getCategories();
  }

  @Get('/:id')
  async getProductDetails(@Param('id') id: string) {
    return await this.productGatewayService.getProductDetails(id);
  }
}
