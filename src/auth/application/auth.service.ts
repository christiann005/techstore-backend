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
import type { Response } from 'express';
import { UsersService } from '../../users/application/users.service';
import { UserRole } from '../../users/domain/user.entity';
import { VerificationCode } from '../infrastructure/persistence/verification-code.schema';
import { MailService } from '../../common/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(VerificationCode.name)
    private readonly verificationModel: Model<VerificationCode>,
    private readonly mailService: MailService,
  ) {}

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
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

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    // Inyectar cookie HttpOnly
    response.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  logout(response: Response) {
    response.clearCookie('access_token');
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
