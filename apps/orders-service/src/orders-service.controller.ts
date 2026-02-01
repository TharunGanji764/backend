import { Controller, Get } from '@nestjs/common';
import { OrdersServiceService } from './orders-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class OrdersServiceController {
  constructor(private readonly ordersServiceService: OrdersServiceService) {}

  @MessagePattern('create_order')
  async createOrder(@Payload() data: any) {
    return await this.ordersServiceService.createOrder(data);
  }
}
