import { Controller, Get } from '@nestjs/common';
import { PaymentServiceService } from './payment-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class PaymentServiceController {
  constructor(private readonly paymentServiceService: PaymentServiceService) {}

  @MessagePattern('create_payment')
  async createPaymentIntent(@Payload() data: any) {
    return await this.paymentServiceService.createPaymentIntent(data);
  }

  @MessagePattern('get_payment_By_Id')
  async getPaymentById(@Payload() data: any) {
    const { OrderId } = data;
    return await this.paymentServiceService.getPaymentById(OrderId);
  }
}
