import { Injectable, Inject } from '@nestjs/common';
import {
  IProductRepository,
  ProductFilters,
} from '../domain/product.repository';
import { Product, Review } from '../domain/product.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async getAllProducts(filters?: ProductFilters): Promise<Product[]> {
    const cacheKey = `products_all_${JSON.stringify(filters || {})}`;
    const cached = await this.cacheManager.get<Product[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const products = await this.productRepository.findAll(filters);
    await this.cacheManager.set(cacheKey, products);
    return products;
  }

  async getProductBySku(sku: string): Promise<Product | null> {
    const cacheKey = `product_sku_${sku}`;
    const cached = await this.cacheManager.get<Product>(cacheKey);
    if (cached) return cached;

    const product = await this.productRepository.findBySku(sku);
    if (product) await this.cacheManager.set(cacheKey, product);
    return product;
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const product = await this.productRepository.create(data);
    await this.clearProductsCache();
    return product;
  }

  async addReviewToProduct(
    sku: string,
    review: Review,
  ): Promise<Product | null> {
    const product = await this.productRepository.addReview(sku, review);
    if (product) {
      await this.cacheManager.del(`product_sku_${sku}`);
      await this.clearProductsCache();
    }
    return product;
  }

  private async clearProductsCache() {
    await this.cacheManager.clear();
  }

  async runSeed(products: Partial<Product>[]): Promise<void> {
    await this.productRepository.seed(products);
    await this.clearProductsCache();
  }
}
