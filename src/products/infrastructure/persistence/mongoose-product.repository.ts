import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IProductRepository } from '../../domain/product.repository';
import { Product } from '../../domain/product.entity';
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
      doc.isActive,
      (doc as any).createdAt,
      (doc as any).updatedAt,
    );
  }

  async findAll(): Promise<Product[]> {
    const docs = await this.productModel.find({ isActive: true }).exec();
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

  async delete(id: string): Promise<boolean> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async seed(products: Partial<Product>[]): Promise<void> {
    await this.productModel.deleteMany({});
    await this.productModel.insertMany(products);
  }
}
