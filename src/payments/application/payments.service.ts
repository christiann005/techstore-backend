import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersService } from '../../orders/application/orders.service';
import { OrderStatus } from '../../orders/infrastructure/persistence/order.entity';

import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
    private eventEmitter: EventEmitter2,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not defined in .env');
    this.stripe = new Stripe(secretKey);
  }

  async createPaymentIntent(orderId: string, amount: number) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convertir a centavos
        currency: 'usd',
        metadata: { orderId },
        payment_method_types: ['card', 'cashapp', 'amazon_pay'],
      });

      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error: unknown) {
      const msg = (error as Error).message ?? String(error);
      throw new BadRequestException(msg);
    }
  }

  async handleWebhook(sig: string, payload: Buffer) {
    const endpointSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    let event: Stripe.Event;

    if (!endpointSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET not configured');
    }

    try {
      event = this.stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err: unknown) {
      const msg = (err as Error).message ?? String(err);
      throw new BadRequestException(`Webhook Error: ${msg}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;
      await this.ordersService.updateOrderStatus(orderId, OrderStatus.PAID);

      // Emitir evento para activar el sistema de notificaciones (Correo, etc)
      this.eventEmitter.emit('order.paid', {
        orderId,
        amount: paymentIntent.amount / 100, // De centavos a dólares/pesos
        userEmail: paymentIntent.receipt_email || undefined, // Stripe puede proveer el email
      });
    }

    return { received: true };
  }
}
