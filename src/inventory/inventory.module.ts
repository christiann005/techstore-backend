import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryEntity } from './infrastructure/persistence/inventory.entity';
import { IInventoryRepository } from './domain/inventory.repository';
import { TypeOrmInventoryRepository } from './infrastructure/persistence/typeorm-inventory.repository';
import { InventoryService } from './application/inventory.service';
import { InventoryController } from './infrastructure/http/inventory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryEntity])],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    {
      provide: IInventoryRepository,
      useClass: TypeOrmInventoryRepository,
    },
  ],
  exports: [IInventoryRepository, InventoryService],
})
export class InventoryModule {}
