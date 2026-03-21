import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';
import { UserDocument } from './user.schema';

@Injectable()
export class MongooseUserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private mapToDomain(doc: UserDocument): User {
    const d = doc as any;
    return new User(
      String(d._id),
      d.email,
      d.fullName,
      d.role,
      d.addresses,
      d.isVerified,
      d.isActive,
      d.createdAt as Date,
      d.updatedAt as Date,
      d.password, // Password al final según el cambio previo en la entidad
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
