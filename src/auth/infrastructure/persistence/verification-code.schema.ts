import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class VerificationCode extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true, enum: ['REGISTER', 'FORGOT_PASSWORD'] })
  type: string;

  @Prop({ default: Date.now, expires: 300 }) // 300 segundos = 5 minutos (TTL Index)
  createdAt: Date;
}

export const VerificationCodeSchema =
  SchemaFactory.createForClass(VerificationCode);
