import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
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

  @Post('create-product/:productId/variants')
  async addProductVariants(
    @Param('productId') productId: number,
    @Body() productData: any,
    @User() userInfo: any,
  ) {
    const { sub: userId } = userInfo;
    const newProductData = {
      productData,
      productId,
      userId,
    };
    return await this.sellergatewayService.addProductVariants(newProductData);
  }
  @Put('update-product/:productId/variants')
  async updateProductVariants(
    @Param('productId') productId: number,
    @Body() productData: any,
    @User() userInfo: any,
  ) {
    const { sub: userId } = userInfo;
    const newProductData = {
      productData,
      productId,
      userId,
    };
    return await this.sellergatewayService.updateProductVariants(newProductData);
  }
  @Delete('delete-product/:productId/attributes')
  async deleteProductAttributes(
    @Param('productId') productId: number,
    @Body() productData: any,
    @User() userInfo: any,
  ) {
    const { sub: userId } = userInfo;
    const newProductData = {
      productData,
      productId,
      userId,
    };
    return await this.sellergatewayService.deleteProductAttributes(newProductData);
  }

  @Get('get-seller-products')
  async getSellerProducts(@User() userInfo: any) {
    const { sub: sellerId } = userInfo;
    return await this.sellergatewayService.getSellerProducts(sellerId);
  }
}
