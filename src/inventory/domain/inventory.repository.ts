import { InventoryEntity } from '../infrastructure/persistence/inventory.entity';

export interface IInventoryRepository {
  findAll(): Promise<InventoryEntity[]>;
  findByProductId(productId: string, manager?: any): Promise<InventoryEntity | null>;
  save(inventory: InventoryEntity, manager?: any): Promise<InventoryEntity>;
}

export const IInventoryRepository = Symbol('IInventoryRepository');
