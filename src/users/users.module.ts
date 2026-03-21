import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserDocument,
  UserSchema,
} from './infrastructure/persistence/user.schema';
import { MongooseUserRepository } from './infrastructure/persistence/mongoose-user.repository';
import { IUserRepository } from './domain/user.repository';
import { UsersService } from './application/users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
  ],
  providers: [
    UsersService,
    {
      provide: IUserRepository,
      useClass: MongooseUserRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
