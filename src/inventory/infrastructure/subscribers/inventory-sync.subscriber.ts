import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProductsService } from '../../../products/application/products.service';

@Injectable()
export class InventorySyncSubscriber {
  private readonly logger = new Logger(InventorySyncSubscriber.name);

  constructor(private readonly productsService: ProductsService) {}

  @OnEvent('inventory.updated', { async: true })
  async handleInventoryUpdated(payload: { productId: string; newStock: number }) {
    this.logger.log(`🔄 Sincronizando Stock en MongoDB para: ${payload.productId}`);
    
    try {
      // Sincronizamos el stock en el catálogo de MongoDB (Lectura rápida)
      await this.productsService.updateProductStock(payload.productId, payload.newStock);
      this.logger.log(`✅ MongoDB Sincronizado: ${payload.productId} -> ${payload.newStock}`);
    } catch (error) {
      this.logger.error(`❌ Fallo crítico al sincronizar stock en MongoDB para ${payload.productId}`, error);
    }
  }
}
