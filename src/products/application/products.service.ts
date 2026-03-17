import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '../domain/product.repository';
import { Product } from '../domain/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
  ) {}

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async getProductBySku(sku: string): Promise<Product | null> {
    return this.productRepository.findBySku(sku);
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    return this.productRepository.create(data);
  }

  async runSeed(products: Partial<Product>[]): Promise<void> {
    return this.productRepository.seed(products);
  }
}
