import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { WishListGatewayService } from '../services/wishlist-gateway.service';
import { AuthGuard } from 'apps/api-gateway/lib/authguard';
import { User } from '../decorators/user.decorator';

@Controller('wishlist')
@UseGuards(AuthGuard)
export class WishListController {
  constructor(
    private readonly wishlistGatewayService: WishListGatewayService,
  ) {}
  @Post('add-to-wishlist')
  async addToWishlist(@Body() body: any, @User() user: any) {
    const payload = { ...body, ...user };
    return await this.wishlistGatewayService.addToWishList(payload);
  }

  @Get('get-wishlist')
  async getWishlist(@User() user: any) {
    const { sub: userId } = user;
    return await this.wishlistGatewayService.getWishlist(userId);
  }
}
