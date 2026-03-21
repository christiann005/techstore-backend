import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './infrastructure/persistence/order.entity';
import { OrderItemEntity } from './infrastructure/persistence/order-item.entity';
import { OrdersService } from './application/orders.service';
import { OrdersController } from './infrastructure/http/orders.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { IOrderRepository } from './domain/order.repository';
import { TypeOrmOrderRepository } from './infrastructure/persistence/typeorm-order.repository';
import { OrderNotifierListener } from './application/listeners/order-notifier.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
    InventoryModule,
    ProductsModule,
    UsersModule,
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrderNotifierListener,
    {
      provide: IOrderRepository,
      useClass: TypeOrmOrderRepository,
    },
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
