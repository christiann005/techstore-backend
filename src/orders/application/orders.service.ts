import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  OrderEntity,
  OrderStatus,
} from '../infrastructure/persistence/order.entity';
import { OrderItemEntity } from '../infrastructure/persistence/order-item.entity';
import { IOrderRepository } from '../domain/order.repository';
import { IInventoryRepository } from '../../inventory/domain/inventory.repository';
import { OrderCreatedEvent } from '../domain/events/order-created.event';
import { EventsGateway } from '../../events/events.gateway';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepository: IOrderRepository,
    @Inject(IInventoryRepository)
    private readonly inventoryRepository: IInventoryRepository,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createOrder(
    userId: string,
    items: {
      productId: string;
      quantity: number;
      productName?: string;
      productImage?: string;
      price: number;
    }[],
  ): Promise<OrderEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const orderItems: OrderItemEntity[] = [];

      for (const item of items) {
        // 1. Verificar Stock Atómico usando el repositorio abstraído con el manager de la transacción
        const inventory = await this.inventoryRepository.findByProductId(
          item.productId,
          queryRunner.manager,
        );

        if (!inventory || inventory.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ID: ${item.productId}`,
          );
        }

        // 2. Descontar Stock
        inventory.stock -= item.quantity;
        await this.inventoryRepository.save(inventory, queryRunner.manager);

        // 3. Calcular Total y crear item
        const orderItem = new OrderItemEntity();
        orderItem.productId = item.productId;
        orderItem.productName = item.productName ?? '';
        orderItem.productImage = item.productImage ?? ''; // Nuevo campo snapshot
        orderItem.quantity = item.quantity;
        orderItem.price = item.price;
        orderItems.push(orderItem);
        totalAmount += item.price * item.quantity;
      }

      // 4. Crear el pedido
      const order = new OrderEntity();
      order.userId = userId;
      order.totalAmount = totalAmount;
      order.status = OrderStatus.PENDING;
      order.items = orderItems;

      const savedOrder = await this.orderRepository.saveWithManager(
        order,
        queryRunner.manager,
      );
      await queryRunner.commitTransaction();

      // Emitir Evento de Dominio (Desacoplado y Asíncrono)
      this.eventEmitter.emit(
        'order.created',
        new OrderCreatedEvent(savedOrder),
      );

      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findUserOrders(userId: string) {
    return this.orderRepository.findByUserId(userId);
  }

  async getAllOrders() {
    return this.orderRepository.findAll();
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.orderRepository.updateStatus(id, status);
    if (!order) throw new NotFoundException('Order not found');

    // Emitir Socket Event
    this.eventsGateway.emitOrderStatusUpdate(order.userId, order.id, status);

    return order;
  }
}
