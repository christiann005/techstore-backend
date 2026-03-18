import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from '../../domain/events/order-created.event';

@Injectable()
export class OrderNotifierListener {
  private readonly logger = new Logger(OrderNotifierListener.name);

  @OnEvent('order.created', { async: true })
  handleOrderCreatedEvent(event: OrderCreatedEvent) {
    const { order, userEmail } = event;
    
    this.logger.log(`🔔 Procesando notificación para la Orden: ${order.id}`);
    
    // Simulación de envío de correo
    setTimeout(() => {
      this.logger.log(`📧 Correo de confirmación enviado a ${userEmail || 'usuario@techstore.com'}`);
      this.logger.log(`📦 Detalles: Total $${order.totalAmount} | Items: ${order.items.length}`);
    }, 2000);
  }
}
