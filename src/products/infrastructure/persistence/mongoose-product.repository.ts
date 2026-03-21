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
    return new Product(
      (doc._id as any).toString(),
      doc.name,
      doc.sku,
      doc.brand,
      doc.description,
      doc.basePrice,
      doc.categories,
      doc.images,
      Object.fromEntries(doc.specifications || new Map()),
      doc.rating,
      doc.reviews || [],
      doc.isActive,
      (doc as any).createdAt,
      (doc as any).updatedAt,
      doc.model3dUrl, // Ahora va al final
    );
  }

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    const query: any = { isActive: true };

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
    return docs.map(this.mapToDomain);
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

    // Asegurar que reviews sea un array
    if (!product.reviews) product.reviews = [];

    // Agregar reseña
    product.reviews.push(review);

    // Recalcular Rating Promedio
    const totalRating = product.reviews.reduce(
      (acc, rev) => acc + rev.rating,
      0,
    );
    product.rating = Number((totalRating / product.reviews.length).toFixed(1));

    await product.save();
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
