import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SellerGatewayService } from '../services/seller-gateway.service';
import { CreateProductDto } from 'apps/api-gateway/dto/create-product.dto';
import { User } from '../decorators/user.decorator';
import { AuthGuard } from 'apps/api-gateway/lib/authguard';

@Controller('seller')
@UseGuards(AuthGuard)
export class SellerGatewayController {
  constructor(private readonly sellergatewayService: SellerGatewayService) {}

  @Post('create-product')
  async createProduct(
    @Body() productData: CreateProductDto,
    @User() userInfo: any,
  ) {
    const { sub: userId } = userInfo;
    return await this.sellergatewayService.createProduct({
      productData,
      userId,
    });
  }
}
