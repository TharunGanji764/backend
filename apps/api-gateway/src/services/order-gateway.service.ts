import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderGatewayService {
  constructor(
    @Inject('ORDER_SERVICE')
    private readonly OrderServiceClient: ClientProxy,
  ) {}
  async createOrder(userData: any, body: any, idempotencyKey: any) {
    return await firstValueFrom(
      this.OrderServiceClient.send('create_order', {
        userData,
        body,
        idempotencyKey,
      }),
    );
  }

  async getPaymentStatus(OrderId: string) {
    return await firstValueFrom(
      this.OrderServiceClient.send('get_payment_status', {
        OrderId,
      }),
    );
  }

  async retryPayment(orderId: String, idempotencyKey: string) {
    return await firstValueFrom(
      this.OrderServiceClient.send('retry_payment', {
        orderId,
        idempotencyKey,
      }),
    );
  }
}
