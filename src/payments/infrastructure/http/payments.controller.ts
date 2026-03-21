import { Controller, Post, Body, Headers, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from '../../application/payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  async createIntent(@Body() data: { orderId: string; amount: number }) {
    return this.paymentsService.createPaymentIntent(data.orderId, data.amount);
  }

  @Post('webhook')
  async webhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: Request & { rawBody?: Buffer },
  ) {
    const raw = (req as unknown as { rawBody?: Buffer }).rawBody ?? Buffer.from('');
    return this.paymentsService.handleWebhook(sig, raw);
  }
}
