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
    const orderId = data?.orderNumber;
    const existing = await this.paymentRepository.findOne({
      where: {
        order_id: orderId,
        status: PaymentStatus.INITIATED,
      },
    });

    if (existing) {
      return existing;
    }

    const payment = await this.paymentRepository.save(
      this.paymentRepository.create({
        order_id: orderId,
        amount: data?.totalAmount,
        currency: data?.currency || 'inr',
        status: PaymentStatus.INITIATED,
        provider: 'stripe',
      }),
    );

    try {
      const paymentIntent =
        await this.stripeService.stripe.paymentIntents.create({
          amount: data?.totalAmount * 100,
          currency: data?.currency || 'inr',
          automatic_payment_methods: { enabled: true },
          metadata: {
            orderId: orderId,
            paymentId: payment.id,
            userId: data.userId,
          },
        });

      await this.paymentRepository.update(payment.id, {
        payment_intent_id: paymentIntent.id,
        payment_secret_key: paymentIntent.client_secret ?? undefined,
      });

      return paymentIntent;
    } catch (err) {
      console.error('Stripe intent creation failed', err);

      await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.FAILED,
      });

      throw err;
    }
  }

  async getPaymentByOrderId(orderId: string) {
    const paymentData = await this.paymentRepository.findOne({
      where: {
        order_id: orderId,
        status: PaymentStatus.INITIATED,
      },
      order: { created_at: 'DESC' },
    });

    if (!paymentData) return null;

    return {
      paymentId: paymentData?.payment_intent_id,
      clientSecret: paymentData?.payment_secret_key,
      amount: paymentData?.amount,
      currency: paymentData?.currency,
      orderId: paymentData?.order_id,
    };
  }

  async markSuccess(intent: any) {
    const paymentIntentId = intent.id;

    const payment = await this.paymentRepository.findOne({
      where: { payment_intent_id: paymentIntentId },
    });
    const chargeId = intent.latest_charge;

    const charge = await this.stripeService.stripe.charges.retrieve(
      chargeId as string,
    );

    const paymentType = charge.payment_method_details?.type;

    if (!payment) return;

    if (payment.status === PaymentStatus.SUCCESS) return;

    await this.paymentRepository.update(payment.id, {
      status: PaymentStatus.SUCCESS,
    });

    const channel = await this.rabbitMq.getChannel();

    const payload = {
      orderId: payment.order_id,
      paymentId: payment.id,
      paymentIntentId: payment.payment_intent_id,
      amount: payment.amount,
      provider: payment.provider,
      status: 'success',
      paymentType,
    };

    channel.publish(
      'order.exchange',
      'payment.success',
      Buffer.from(JSON.stringify(payload)),
      { persistent: true },
    );
  }

  async markFailed(intent: any) {
    const paymentIntentId = intent.id;

    const payment = await this.paymentRepository.findOne({
      where: { payment_intent_id: paymentIntentId },
    });

    const chargeId = intent.latest_charge;

    const charge = await this.stripeService.stripe.charges.retrieve(
      chargeId as string,
    );

    const paymentType = charge.payment_method_details?.type;

    if (!payment) return;

    if (payment.status === PaymentStatus.FAILED) return;

    await this.paymentRepository.update(payment.id, {
      status: PaymentStatus.FAILED,
    });

    const channel = await this.rabbitMq.getChannel();

    const payload = {
      orderId: payment.order_id,
      paymentId: payment.id,
      paymentIntentId: payment.payment_intent_id,
      amount: payment.amount,
      provider: payment.provider,
      status: 'failed',
      paymentType,
    };

    channel.publish(
      'order.exchange',
      'payment.failed',
      Buffer.from(JSON.stringify(payload)),
      { persistent: true },
    );
  }
}
