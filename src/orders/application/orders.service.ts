import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrderEntity, OrderStatus } from '../infrastructure/persistence/order.entity';
import { InventoryEntity } from '../../inventory/infrastructure/persistence/inventory.entity';
import { OrderItemEntity } from '../infrastructure/persistence/order-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async createOrder(userId: string, items: any[]): Promise<OrderEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const orderItems: OrderItemEntity[] = [];

      for (const item of items) {
        // 1. Verificar Stock Atómico
        const inventory = await queryRunner.manager.findOne(InventoryEntity, {
          where: { productId: item.productId },
          lock: { mode: 'pessimistic_write' }, // Bloquear fila para evitar condiciones de carrera
        });

        if (!inventory || inventory.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ID: ${item.productId}`);
        }

        // 2. Descontar Stock
        inventory.stock -= item.quantity;
        await queryRunner.manager.save(inventory);

        // 3. Calcular Total y crear item
        totalAmount += item.price * item.quantity;
        const orderItem = new OrderItemEntity();
        orderItem.productId = item.productId;
        orderItem.productName = item.productName;
        orderItem.quantity = item.quantity;
        orderItem.price = item.price;
        orderItems.push(orderItem);
      }

      // 4. Crear el pedido
      const order = new OrderEntity();
      order.userId = userId;
      order.totalAmount = totalAmount;
      order.status = OrderStatus.PENDING;
      order.items = orderItems;

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findUserOrders(userId: string) {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orderRepository.save(order);
  }
}
