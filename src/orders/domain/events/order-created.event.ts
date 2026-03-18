import { OrderEntity } from '../../infrastructure/persistence/order.entity';

export class OrderCreatedEvent {
  constructor(
    public readonly order: OrderEntity,
    public readonly userEmail?: string,
  ) {}
}
