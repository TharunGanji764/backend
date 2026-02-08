import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Payments } from '../schemas/payments.entity';
import { Repository } from 'typeorm';
import { PaymentStatus } from '../enums/enums';
import { StripeService } from './stripe/stripe.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentServiceService implements OnModuleInit {
  constructor(
    private readonly rabbitMq: RabbitmqService,
    @InjectRepository(Payments)
    private readonly paymentRepository: Repository<Payments>,
    private readonly stripeService: StripeService,
  ) {}

  async onModuleInit() {
    const channel = await this.rabbitMq.getChannel();

    await channel.prefetch(1);

    await channel.consume(
      'payment.order.created',
      async (msg) => {
        if (!msg) return;

        try {
          const data = JSON.parse(msg.content.toString());
          const paymentIntent =
            await this.stripeService.stripe.paymentIntents.create({
              amount: data.totalAmount * 100,
              currency: data.currency || 'inr',
              // automatic_payment_methods: { enabled: true },
              payment_method_types: ['card', 'Google Pay', 'netbanking'],
            });

          const payment = await this.paymentRepository.create({
            order_id: data?.orderNumber,
            amount: data?.totalAmount,
            currency: data?.currency,
            status: PaymentStatus.INITIATED,
            provider: 'stripe',
            payment_intent_id: paymentIntent.id,
            payment_secret_key: paymentIntent.client_secret ?? undefined,
          });

          await this.paymentRepository.save(payment);
          channel.ack(msg);
        } catch (err) {
          console.error('Consumer error', err);
          channel.nack(msg, false, false);
        }
      },
      { noAck: false },
    );
  }

  async getPaymentById(orderId: any) {
    const paymentData = await this.paymentRepository.findOne({
      where: {
        order_id: orderId,
      },
    });
    return {
      paymentId: paymentData?.order_id,
      clientSecret: paymentData?.payment_secret_key,
      amount: paymentData?.amount,
    };
  }

  async markSuccess(intent: any) {
    const paymentId = intent.id;
    const payment = await this.paymentRepository.findOne({
      where: { payment_intent_id: paymentId },
    });

    if (payment?.status === PaymentStatus.SUCCESS) return;

    if (payment?.id) {
      await this.paymentRepository.update(payment.id, {
        status: PaymentStatus?.SUCCESS,
      });
    }

    // publish event to other services
    // await this.tcpClient.emit('payment.completed', {
    //   orderId,
    //   paymentId,
    // });
  }

  async markFailed(intent: any) {
    const paymentId = intent.metadata.paymentId;

    // await this.updatePayment(paymentId, {
    //   status: 'FAILED',
    // });
  }
}
