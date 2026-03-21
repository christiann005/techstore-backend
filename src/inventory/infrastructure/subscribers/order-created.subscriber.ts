import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InventoryService } from '../../application/inventory.service';

@Injectable()
export class OrderCreatedSubscriber {
  private readonly logger = new Logger(OrderCreatedSubscriber.name);

  constructor(private readonly inventoryService: InventoryService) {}

  @OnEvent('order.created', { async: true })
  async handleOrderCreatedEvent(payload: { 
    orderId: string; 
    items: Array<{ productId: string; quantity: number }> 
  }) {
    this.logger.log(`📦 Procesando stock para la Orden: ${payload.orderId}`);
    
    try {
      for (const item of payload.items) {
        // Obtenemos el inventario actual
        const currentInv = await this.inventoryService.getByProductId(item.productId);
        
        if (currentInv) {
          const newStock = currentInv.stock - item.quantity;
          
          if (newStock < 0) {
            this.logger.warn(`⚠️ Stock insuficiente para producto ${item.productId}. Pendiente implementar rollback.`);
            // En una Saga completa, aquí emitiríamos un evento 'order.failed.stock'
          }

          await this.inventoryService.updateStock(item.productId, newStock);
          this.logger.log(`✅ Stock actualizado para ${item.productId}: ${newStock}`);
        }
      }
    } catch (error) {
      this.logger.error(`❌ Error fatal actualizando inventario para orden ${payload.orderId}`, error);
    }
  }
}
