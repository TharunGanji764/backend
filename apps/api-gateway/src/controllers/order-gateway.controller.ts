import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderGatewayService } from '../services/order-gateway.service';
import { User } from '../decorators/user.decorator';
import { AuthGuard } from 'apps/api-gateway/lib/authguard';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrderGatewayController {
  constructor(private readonly orderGatewayService: OrderGatewayService) {}
  @Post('/')
  async createOrder(@User() user: any, @Body() body: any, @Req() req: any) {
    const idempotencyKey = req.headers['idempotency-key'];
    return await this.orderGatewayService.createOrder(
      user,
      body,
      idempotencyKey,
    );
  }

  @Get(':orderId/payment')
  async getPaymentStatus(@Param('orderId') orderId: string) {
    return await this.orderGatewayService.getPaymentStatus(orderId);
  }

  @Post(':orderId/retry-payment')
  async retryPayment(@Param('orderId') orderId: string, @Req() req: any) {
    const idempotencyKey = req.headers['idempotency-key'];

    return await this.orderGatewayService.retryPayment(orderId, idempotencyKey);
  }
}
