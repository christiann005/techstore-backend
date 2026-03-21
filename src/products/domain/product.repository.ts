import { Product, Review } from './product.entity';

export class ProductFilters {
  name?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface IProductRepository {
  findAll(filters?: ProductFilters): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  create(product: Partial<Product>): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product | null>;
  addReview(sku: string, review: Review): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
  seed(products: Partial<Product>[]): Promise<void>;
  updateStock(productId: string, stock: number): Promise<void>;
}

export const IProductRepository = Symbol('IProductRepository');
