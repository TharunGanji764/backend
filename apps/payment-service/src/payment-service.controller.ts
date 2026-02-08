import { Controller, Get } from '@nestjs/common';
import { PaymentServiceService } from './payment-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class PaymentServiceController {
  constructor(private readonly paymentServiceService: PaymentServiceService) {}
  @MessagePattern('get_payment_By_Id')
  async getPaymentById(@Payload() data: any) {
    const { OrderId } = data;
    return await this.paymentServiceService.getPaymentById(OrderId);
  }
}
