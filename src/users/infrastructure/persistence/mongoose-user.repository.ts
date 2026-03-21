import { Injectable, ConflictException } from '@nestjs/common';
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
      String(doc._id),
      doc.email,
      doc.fullName,
      doc.role,
      doc.addresses,
      doc.isVerified,
      doc.isActive,
      doc.createdAt as Date,
      doc.updatedAt as Date,
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
    } catch (err: unknown) {
      const e = err as { code?: number };
      if (e.code === 11000) {
        throw new ConflictException('Email already in use');
      }
      throw err as Error;
    }
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const doc = await this.userModel
      .findByIdAndUpdate(id, user, { new: true })
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }
}
