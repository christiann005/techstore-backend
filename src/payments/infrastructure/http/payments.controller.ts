import { Controller, Post, Body, UseGuards, Request, Headers } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { PaymentsService } from '../../application/payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  async createIntent(@Body() data: { orderId: string, amount: number }) {
    return this.paymentsService.createPaymentIntent(data.orderId, data.amount);
  }

  @Post('webhook')
  async webhook(
    @Headers('stripe-signature') sig: string,
    @Request() req: any,
  ) {
    return this.paymentsService.handleWebhook(sig, (req as RawBodyRequest<any>).rawBody as Buffer);
  }
}
