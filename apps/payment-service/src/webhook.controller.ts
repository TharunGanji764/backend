import { Controller, Headers, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe/stripe.service';
import { PaymentServiceService } from './payment-service.service';
import Stripe from 'stripe';

@Controller('payments')
export class PaymentsWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentsService: PaymentServiceService,
  ) {}

  @Post('webhook')
  async handleWebhook(
    @Req() req: Request & { rawBody: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripeService.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      console.error('Stripe webhook signature verification failed');
      return { error: 'Invalid signature' };
    }

    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log('event: ', event);
    console.log('paymentIntent: ', paymentIntent);

    if (event.type === 'payment_intent.succeeded') {
      await this.paymentsService.markSuccess(paymentIntent);
    }

    if (event.type === 'payment_intent.payment_failed') {
      await this.paymentsService.markFailed(paymentIntent);
    }
    return { received: true };
  }
}
