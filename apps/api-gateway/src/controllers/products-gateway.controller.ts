import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Controller, Get } from '@nestjs/common';
import { ProductGatewayService } from '../services/product-gateway.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly httpService: HttpService,
    private readonly productGatewayService: ProductGatewayService,
  ) {}

  @Get('/')
  async getProductsData() {
    return await this.productGatewayService.getProducts();
  }
}
