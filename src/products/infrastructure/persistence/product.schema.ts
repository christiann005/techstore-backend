import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'products' })
export class ProductDocument extends Document {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  sku: string;

  @Prop({ required: true, index: true })
  brand: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Number })
  basePrice: number;

  @Prop({ type: [String], index: true })
  categories: string[];

  @Prop({ type: [String] })
  images: string[];

  @Prop()
  model3dUrl: string;

  @Prop()
  officialUrl: string;

  @Prop({ type: Map, of: String })
  // Flexibilidad total para especificaciones técnicas
  specifications: Map<string, any>;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  stock: number;

  @Prop({
    type: [
      {
        userName: String,
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  reviews: any[];

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(ProductDocument);
