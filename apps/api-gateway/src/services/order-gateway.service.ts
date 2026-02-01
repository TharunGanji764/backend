import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderGatewayService {
  constructor(
    @Inject('ORDER_SERVICE')
    private readonly OrderServiceClient: ClientProxy,
  ) {}
  async createOrder(userData: any, body: any) {
    return await firstValueFrom(
      this.OrderServiceClient.send('create_order', { userData, body }),
    );
  }
}
