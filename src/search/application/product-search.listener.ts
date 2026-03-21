import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SearchService } from './search.service';

@Injectable()
export class ProductSearchListener {
  constructor(private readonly searchService: SearchService) {}

  @OnEvent('product.created', { async: true })
  async handleProductCreated(product: any) {
    // Transformar producto si es necesario para el índice
    await this.searchService.indexProduct(product);
  }

  @OnEvent('product.updated', { async: true })
  async handleProductUpdated(product: any) {
    await this.searchService.indexProduct(product);
  }
}
