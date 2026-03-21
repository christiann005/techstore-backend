import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductDocument,
  ProductSchema,
} from './infrastructure/persistence/product.schema';
import { MongooseProductRepository } from './infrastructure/persistence/mongoose-product.repository';
import { IProductRepository } from './domain/product.repository';
import { ProductsService } from './application/products.service';
import { ProductsController } from './infrastructure/http/products.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductDocument.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    {
      provide: IProductRepository,
      useClass: MongooseProductRepository,
    },
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
