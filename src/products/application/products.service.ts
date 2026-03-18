import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository, ProductFilters } from '../domain/product.repository';
import { Product, Review } from '../domain/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
  ) {}

  async getAllProducts(filters?: ProductFilters): Promise<Product[]> {
    return this.productRepository.findAll(filters);
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

  async addReviewToProduct(sku: string, review: Review): Promise<Product | null> {
    return this.productRepository.addReview(sku, review);
  }

  async runSeed(products: Partial<Product>[]): Promise<void> {
    return this.productRepository.seed(products);
  }
}
