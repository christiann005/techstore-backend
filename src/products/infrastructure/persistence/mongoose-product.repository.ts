import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  IProductRepository,
  ProductFilters,
} from '../../domain/product.repository';
import { Product, Review } from '../../domain/product.entity';
import { ProductDocument } from './product.schema';

@Injectable()
export class MongooseProductRepository implements IProductRepository {
  constructor(
    @InjectModel(ProductDocument.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  private mapToDomain(doc: ProductDocument): Product {
    const d = doc as unknown as {
      _id: unknown;
      name: string;
      sku?: string;
      brand?: string;
      description?: string;
      basePrice?: number;
      categories?: string[];
      images?: string[];
      specifications?: Map<string, unknown>;
      rating?: number;
      reviews?: Review[];
      isActive?: boolean;
      createdAt?: Date;
      updatedAt?: Date;
      model3dUrl?: string;
    };

    return new Product(
      String(d._id),
      d.name,
      d.sku ?? '',
      d.brand ?? '',
      d.description ?? '',
      d.basePrice ?? 0,
      d.categories ?? [],
      d.images ?? [],
      Object.fromEntries(d.specifications || new Map()),
      d.rating ?? 0,
      d.reviews ?? [],
      d.isActive ?? true,
      d.createdAt as Date,
      d.updatedAt as Date,
      d.model3dUrl ?? '', // Ahora va al final
    );
  }

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    const query: Record<string, unknown> = { isActive: true };

    if (filters) {
      if (filters.name) {
        query.name = { $regex: filters.name, $options: 'i' };
      }
      if (filters.category) {
        query.categories = filters.category;
      }
      if (filters.brand) {
        query.brand = { $regex: filters.brand, $options: 'i' };
      }
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query.basePrice = {};
        if (filters.minPrice !== undefined)
          query.basePrice.$gte = filters.minPrice;
        if (filters.maxPrice !== undefined)
          query.basePrice.$lte = filters.maxPrice;
      }
    }

    const docs = await this.productModel.find(query).exec();
    return docs.map((d) => this.mapToDomain(d));
  }

  async findById(id: string): Promise<Product | null> {
    const doc = await this.productModel.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const doc = await this.productModel.findOne({ sku }).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async create(product: Partial<Product>): Promise<Product> {
    const created = new this.productModel(product);
    const doc = await created.save();
    return this.mapToDomain(doc);
  }

  async update(id: string, product: Partial<Product>): Promise<Product | null> {
    const doc = await this.productModel
      .findByIdAndUpdate(id, product, { new: true })
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async addReview(sku: string, review: Review): Promise<Product | null> {
    const product = await this.productModel.findOne({ sku }).exec();
    if (!product) return null;

    const p = product as unknown as {
      reviews?: Review[];
      rating?: number;
      save: () => Promise<any>;
    };

    // Asegurar que reviews sea un array
    if (!p.reviews) p.reviews = [];

    // Agregar reseña
    p.reviews.push(review);

    // Recalcular Rating Promedio
    const totalRating = p.reviews.reduce((acc, rev) => acc + (rev.rating ?? 0), 0);
    p.rating = Number((totalRating / p.reviews.length).toFixed(1));

    await p.save();
    return this.mapToDomain(product);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async seed(products: Partial<Product>[]): Promise<void> {
    await this.productModel.deleteMany({});
    await this.productModel.insertMany(products);
  }
}
