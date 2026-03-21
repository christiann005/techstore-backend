import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../../domain/user.repository';
import { User, UserRole } from '../../domain/user.entity';
import { UserDocument } from './user.schema';

@Injectable()
export class MongooseUserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private mapToDomain(doc: UserDocument): User {
    return new User(
      (doc._id as any).toString(),
      doc.email,
      doc.fullName,
      doc.role,
      doc.addresses,
      doc.isVerified,
      doc.isActive,
      (doc as any).createdAt,
      (doc as any).updatedAt,
      doc.password, // Password al final según el cambio previo en la entidad
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.userModel
      .findOne({ email })
      .select('+password')
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.userModel.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async create(user: Partial<User>): Promise<User> {
    try {
      const created = new this.userModel(user);
      const doc = await created.save();
      return this.mapToDomain(doc);
    } catch (err: any) {
      // Handle duplicate key error from MongoDB (e.g., email already exists)
      if (err && err.code === 11000) {
        const { ConflictException } = require('@nestjs/common');
        throw new ConflictException('Email already in use');
      }
      throw err;
    }
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const doc = await this.userModel
      .findByIdAndUpdate(id, user, { new: true })
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }
}
