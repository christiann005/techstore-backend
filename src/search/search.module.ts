import { Module } from '@nestjs/common';
import { SearchService } from './application/search.service';
import { ProductSearchListener } from './application/product-search.listener';

@Module({
  providers: [SearchService, ProductSearchListener],
  exports: [SearchService],
})
export class SearchModule {}
