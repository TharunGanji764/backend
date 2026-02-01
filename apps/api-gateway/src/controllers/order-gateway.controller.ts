import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OrderGatewayService } from '../services/order-gateway.service';
import { User } from '../decorators/user.decorator';
import { AuthGuard } from 'apps/api-gateway/lib/authguard';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrderGatewayController {
  constructor(private readonly orderGatewayService: OrderGatewayService) {}
  @Post('/')
  async createOrder(@User() user: any, @Body() body: any) {
    return await this.orderGatewayService.createOrder(user, body);
  }
}
