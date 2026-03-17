import { Module } from '@nestjs/common';
import { PaymentsService } from './application/payments.service';
import { PaymentsController } from './infrastructure/http/payments.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
