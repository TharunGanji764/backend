import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private channel: amqp.Channel;

  private ready: Promise<void>;
  private resolveReady!: () => void;

  constructor() {
    this.ready = new Promise((res) => {
      this.resolveReady = res;
    });
  }

  async onModuleInit() {
    const connection = await amqp.connect('amqp://localhost:5672');
    this.channel = await connection.createChannel();

    this.channel.on('return', (msg) => {
      console.error(
        'UNROUTABLE MESSAGE:',
        msg.fields.routingKey,
        msg.content.toString(),
      );
    });

    await this.channel.assertExchange('order.exchange', 'topic', {
      durable: true,
    });

    await this.channel.assertQueue('order.payment.result', { durable: true });

    await this.channel.bindQueue(
      'order.payment.result',
      'order.exchange',
      'payment.*',
    );

    this.resolveReady();
  }

  async publish(routingKey: string, payload: any) {
    await this.ready;
    this.channel.publish(
      'order.exchange',
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true, mandatory: true },
    );
  }

  async getChannel(): Promise<amqp.Channel> {
    await this.ready;
    return this.channel;
  }
}
