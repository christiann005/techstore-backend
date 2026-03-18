import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { OrderEntity, OrderStatus } from './order.entity';
import { IOrderRepository } from '../../domain/order.repository';

@Injectable()
export class TypeOrmOrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
  ) {}

  async findAll(): Promise<OrderEntity[]> {
    return this.repository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(order: Partial<OrderEntity>): Promise<OrderEntity> {
    const newOrder = this.repository.create(order);
    return this.repository.save(newOrder);
  }

  async findById(id: string): Promise<OrderEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
  }

  async findByUserId(userId: string): Promise<OrderEntity[]> {
    return this.repository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderEntity | null> {
    const order = await this.findById(id);
    if (!order) return null;
    order.status = status;
    return this.repository.save(order);
  }

  async saveWithManager(order: OrderEntity, manager: EntityManager): Promise<OrderEntity> {
    return manager.save(order);
  }
}
