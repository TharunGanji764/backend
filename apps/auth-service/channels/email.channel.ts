import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationChannel } from '../interfaces/notification-channel.interface';

@Injectable()
export class EmailChannel implements NotificationChannel {
  constructor(
    @Inject('NOTIFICATION_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  async send(to: string, message: number): Promise<void> {
    await this.client.emit('send-otp-email', { email: to, otp: message });
  }
}
