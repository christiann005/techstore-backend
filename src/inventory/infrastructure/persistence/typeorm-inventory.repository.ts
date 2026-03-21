import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { InventoryEntity } from './inventory.entity';
import { IInventoryRepository } from '../../domain/inventory.repository';

@Injectable()
export class TypeOrmInventoryRepository implements IInventoryRepository {
  constructor(
    @InjectRepository(InventoryEntity)
    private readonly repository: Repository<InventoryEntity>,
  ) {}

  async findAll(): Promise<InventoryEntity[]> {
    return this.repository.find();
  }

  async findByProductId(
    productId: string,
    manager?: EntityManager,
  ): Promise<InventoryEntity | null> {
    const repo = manager
      ? manager.getRepository(InventoryEntity)
      : this.repository;
    return repo.findOne({
      where: { productId },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async save(
    inventory: InventoryEntity,
    manager?: EntityManager,
  ): Promise<InventoryEntity> {
    const repo = manager
      ? manager.getRepository(InventoryEntity)
      : this.repository;
    return repo.save(inventory);
  }
}
