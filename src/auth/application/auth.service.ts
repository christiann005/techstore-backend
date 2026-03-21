import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { verify } from 'otplib';
import { v4 as uuidv4 } from 'uuid';
import type { Response } from 'express';
import { UsersService } from '../../users/application/users.service';
import { UserRole } from '../../users/domain/user.entity';
import { VerificationCode } from '../infrastructure/persistence/verification-code.schema';
import { RefreshToken } from '../infrastructure/persistence/refresh-token.schema';
import { MailService } from '../../common/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(VerificationCode.name)
    private readonly verificationModel: Model<VerificationCode>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    private readonly mailService: MailService,
  ) {}

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Helper Senior para manejar tokens
  private async createSession(user: any, response: Response) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    // Access Token (Corto: 15m)
    const accessToken = this.jwtService.sign(payload);
    
    // Refresh Token (Largo: 7d)
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Persistir Refresh Token en MongoDB
    await this.refreshTokenModel.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    // Inyectar Cookies HttpOnly
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };

    response.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    response.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }

  async register(data: { email: string; password: string; fullName?: string }) {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      ...data,
      password: hashedPassword,
      role: UserRole.CUSTOMER,
      isVerified: false,
    });

    const code = this.generateOTP();
    await this.verificationModel.create({
      email: user.email,
      code,
      type: 'REGISTER',
    });

    await this.mailService.sendVerificationCode(user.email, code);

    return { message: 'Verification code sent to email', email: user.email };
  }

  async verifyCode(email: string, code: string) {
    const record = await this.verificationModel.findOne({
      email,
      code,
      type: 'REGISTER',
    });
    if (!record) throw new BadRequestException('Invalid or expired code');

    await this.usersService.updateByEmail(email, { isVerified: true });
    await this.verificationModel.deleteOne({ _id: record._id });

    return { message: 'Account verified successfully' };
  }

  async login(email: string, pass: string, response: Response) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password)
      throw new UnauthorizedException('Invalid credentials');

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Account not verified. Please check your email.',
      );
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    if (user.isTwoFactorEnabled) {
      return {
        mfaRequired: true,
        userId: user.id,
        email: user.email,
        message: 'MFA_REQUIRED',
      };
    }

    const userData = await this.createSession(user, response);

    return {
      message: 'Login successful',
      user: userData,
    };
  }

  async login2fa(userId: string, token: string, response: Response) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('MFA not enabled for this user');
    }

    const { valid } = await verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (!valid) {
      throw new UnauthorizedException('Invalid authentication code');
    }

    const userData = await this.createSession(user, response);

    return {
      message: 'Login successful',
      user: userData,
    };
  }

  async refresh(refreshToken: string, response: Response) {
    const tokenDoc = await this.refreshTokenModel.findOne({
      token: refreshToken,
      isRevoked: false,
    });

    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(tokenDoc.userId);
    if (!user) throw new UnauthorizedException();

    // Rotación de Refresh Token (Seguridad Máxima)
    await this.refreshTokenModel.deleteOne({ _id: tokenDoc._id });
    
    const userData = await this.createSession(user, response);
    return { user: userData };
  }

  async logout(refreshToken: string, response: Response) {
    if (refreshToken) {
      await this.refreshTokenModel.deleteOne({ token: refreshToken });
    }
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const code = this.generateOTP();
    await this.verificationModel.create({
      email,
      code,
      type: 'FORGOT_PASSWORD',
    });

    await this.mailService.sendResetPassword(email, code);
    return { message: 'Password reset code sent to email' };
  }

  async resetPassword(email: string, code: string, newPass: string) {
    const record = await this.verificationModel.findOne({
      email,
      code,
      type: 'FORGOT_PASSWORD',
    });
    if (!record) throw new BadRequestException('Invalid or expired code');

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await this.usersService.updateByEmail(email, { password: hashedPassword });
    await this.verificationModel.deleteOne({ _id: record._id });

    return { message: 'Password reset successful' };
  }
}
