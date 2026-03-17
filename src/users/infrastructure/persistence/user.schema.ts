import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../domain/user.entity';

@Schema({ timestamps: true, collection: 'users' })
export class UserDocument extends Document {
  @Prop({ required: true, unique: true, index: true, lowercase: true })
  email: string;

  @Prop({ required: true, select: false }) // Password oculto por defecto
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Prop({ type: [String], default: [] })
  addresses: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
