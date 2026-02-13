import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Payments } from '../schemas/payments.entity';
import { Repository } from 'typeorm';
import { PaymentStatus } from '../enums/enums';
import { StripeService } from './stripe/stripe.service';

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

          // await this.createPaymentIntent(data);

          // channel.ack(msg);
        } catch (err) {
          console.error('Consumer error', err);
          channel.nack(msg, false, false);
        }
      },
      { noAck: false },
    );
  }

  async createPaymentIntent(data: any) {
    const existing = await this.paymentRepository.findOne({
      where: { order_id: data?.orderNumber },
    });

    if (existing) {
      return existing;
    }

    const paymentIntent = await this.stripeService.stripe.paymentIntents.create(
      {
        amount: data.totalAmount * 100,
        currency: data.currency || 'inr',
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: data.userId,
          orderId: data.orderId,
        },
      },
    );

    const payment = this.paymentRepository.create({
      order_id: data?.orderNumber,
      amount: data?.totalAmount,
      currency: data?.currency,
      status: PaymentStatus.INITIATED,
      provider: 'stripe',
      payment_intent_id: paymentIntent.id,
      payment_secret_key: paymentIntent.client_secret ?? undefined,
    });

    return await this.paymentRepository.save(payment);
  }

  async getPaymentById(orderId: any) {
    const paymentData = await this.paymentRepository.findOne({
      where: { order_id: orderId },
    });

    return {
      paymentId: paymentData?.order_id,
      clientSecret: paymentData?.payment_secret_key,
      amount: paymentData?.amount,
    };
  }

  async markSuccess(intent: any) {
    const paymentId = intent.id;
    // const orderId = intent.metadata.orderId; will use this in future if needed
    const userId = intent.metadata.userId;

    const payment = await this.paymentRepository.findOne({
      where: { payment_intent_id: paymentId },
    });
    const chargeId = intent.latest_charge;

    const charge = await this.stripeService.stripe.charges.retrieve(
      chargeId as string,
    );

    const paymentType = charge.payment_method_details?.type;

    if (!payment) return;
    if (payment?.status === PaymentStatus.SUCCESS) return;
    if (payment?.order_id) {
      await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.SUCCESS,
      });
    }
    const channel = await this.rabbitMq.getChannel();
    const payload = {
      orderNumber: payment?.order_id,
      paymentIntentId: payment?.payment_intent_id,
      status: 'success',
      amount: payment?.amount,
      provider: payment?.provider,
      paymentType: paymentType,
      userId,
    };
    channel.publish(
      'order.exchange',
      'payment.success',
      Buffer.from(JSON.stringify(payload)),
      { persistent: true },
    );
  }

  async markFailed(intent: any) {
    const paymentId = intent.id;
    const payment = await this.paymentRepository.findOne({
      where: { payment_intent_id: paymentId },
    });
    if (!payment) return;
    if (payment?.order_id) {
      await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.FAILED,
      });
    }
  }
}
