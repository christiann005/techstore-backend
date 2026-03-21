import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByIdWithSecrets(id: string): Promise<User | null> {
    return this.userRepository.findByIdWithSecrets(id);
  }

  async create(user: Partial<User>): Promise<User> {
    return this.userRepository.create(user);
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    return this.userRepository.update(id, user);
  }

  async updateByEmail(
    email: string,
    user: Partial<User>,
  ): Promise<User | null> {
    const existing = await this.findByEmail(email);
    if (!existing) return null;
    return this.userRepository.update(existing.id, user);
  }
}
