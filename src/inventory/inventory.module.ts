import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryEntity } from './infrastructure/persistence/inventory.entity';
import { InventoryService } from './application/inventory.service';
import { IInventoryRepository } from './domain/inventory.repository';
import { TypeOrmInventoryRepository } from './infrastructure/persistence/typeorm-inventory.repository';
import { EventsModule } from '../events/events.module';
import { ProductsModule } from '../products/products.module';
import { OrderCreatedSubscriber } from './infrastructure/subscribers/order-created.subscriber';
import { InventorySyncSubscriber } from './infrastructure/subscribers/inventory-sync.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryEntity]),
    forwardRef(() => EventsModule),
    forwardRef(() => ProductsModule),
  ],
  providers: [
    InventoryService,
    OrderCreatedSubscriber,
    InventorySyncSubscriber,
    {
      provide: IInventoryRepository,
      useClass: TypeOrmInventoryRepository,
    },
  ],
  exports: [InventoryService, IInventoryRepository],
})
export class InventoryModule {}
