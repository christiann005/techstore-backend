import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IInventoryRepository } from '../domain/inventory.repository';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(IInventoryRepository)
    private readonly repository: IInventoryRepository,
  ) {}

  async getAll() {
    return this.repository.findAll();
  }

  async updateStock(productId: string, stock: number) {
    let inventory = await this.repository.findByProductId(productId);
    
    if (!inventory) {
      // Si no existe, lo creamos
      const newInv = { productId, stock } as any;
      return this.repository.save(newInv);
    }
    
    inventory.stock = stock;
    return this.repository.save(inventory);
  }
}
