import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { AuthService } from './application/auth.service';
import { TwoFactorService } from './application/two-factor.service';
import { AuthController } from './infrastructure/http/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import {
  VerificationCode,
  VerificationCodeSchema,
} from './infrastructure/persistence/verification-code.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './infrastructure/persistence/refresh-token.schema';
import { MailService } from '../common/mail/mail.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MongooseModule.forFeature([
      { name: VerificationCode.name, schema: VerificationCodeSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m', // Access token corto para seguridad (Senior)
        },
      }),
    }),
  ],
  providers: [AuthService, TwoFactorService, JwtStrategy, MailService],
  controllers: [AuthController],
})
export class AuthModule {}
