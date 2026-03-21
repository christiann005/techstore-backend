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
import { IProductRepository } from '../../products/domain/product.repository';
import { UsersService } from '../../users/application/users.service';
import { OrderCreatedEvent } from '../domain/events/order-created.event';
import { EventsGateway } from '../../events/events.gateway';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepository: IOrderRepository,
    @Inject(IInventoryRepository)
    private readonly inventoryRepository: IInventoryRepository,
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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
    // 0. Obtener Email del Usuario para la Notificación
    const user = await this.usersService.findById(userId);
    const userEmail = user?.email;

    // 0. Verificación Previa en Catálogo (MongoDB)
    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found in catalog`,
        );
      }
    }

    // 0.1 Bloqueo Distribuido (Lock) por Producto
    // Evita que múltiples hilos intenten procesar el mismo stock simultáneamente
    const locks: string[] = [];
    try {
      for (const item of items) {
        const lockKey = `lock:product:${item.productId}`;
        const isLocked = await this.cacheManager.get(lockKey);

        if (isLocked) {
          throw new BadRequestException(
            'Product is currently being processed. Please try again in a few seconds.',
          );
        }

        // Establecer bloqueo por 5 segundos
        await this.cacheManager.set(lockKey, 'locked', 5000);
        locks.push(lockKey);
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        let totalAmount = 0;
        const orderItems: OrderItemEntity[] = [];

        for (const item of items) {
          // 1. Verificar Stock Atómico
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

          // 3. Calcular Total
          const orderItem = new OrderItemEntity();
          orderItem.productId = item.productId;
          orderItem.productName = item.productName ?? '';
          orderItem.productImage = item.productImage ?? '';
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

        this.eventEmitter.emit(
          'order.created',
          new OrderCreatedEvent(savedOrder, userEmail),
        );

        return savedOrder;
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } finally {
      // Liberar todos los bloqueos
      for (const lockKey of locks) {
        await this.cacheManager.del(lockKey);
      }
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
