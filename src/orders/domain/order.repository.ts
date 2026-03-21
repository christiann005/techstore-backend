import {
  OrderEntity,
  OrderStatus,
} from '../infrastructure/persistence/order.entity';

export interface IOrderRepository {
  findAll(): Promise<OrderEntity[]>;
  create(order: Partial<OrderEntity>): Promise<OrderEntity>;
  findById(id: string): Promise<OrderEntity | null>;
  findByUserId(userId: string): Promise<OrderEntity[]>;
  updateStatus(id: string, status: OrderStatus): Promise<OrderEntity | null>;
  saveWithManager(order: OrderEntity, manager: any): Promise<OrderEntity>;
}

export const IOrderRepository = Symbol('IOrderRepository');
