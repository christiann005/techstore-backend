import { Injectable, Inject } from '@nestjs/common';
import { IInventoryRepository } from '../domain/inventory.repository';
import { EventsGateway } from '../../events/events.gateway';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(IInventoryRepository)
    private readonly repository: IInventoryRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async getAll() {
    return this.repository.findAll();
  }

  async updateStock(productId: string, stock: number) {
    const inventory = await this.repository.findByProductId(productId);

    if (!inventory) {
      // Si no existe, lo creamos
      const newInv = { productId, stock };
      const saved = await this.repository.save(newInv as any);
      this.eventsGateway.emitStockUpdate(productId, stock);
      return saved;
    }

    inventory.stock = stock;
    const saved = await this.repository.save(inventory);
    this.eventsGateway.emitStockUpdate(productId, stock);
    return saved;
  }
}
