import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { TwoFactorService } from '../../application/two-factor.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generateTwoFactor(@Req() req: Request) {
    const user = (req as any).user;
    return this.twoFactorService.generateSecret(user.userId, user.email);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('2fa/turn-on')
  async turnOnTwoFactor(@Req() req: Request, @Body() body: { token: string }) {
    const user = (req as any).user;
    const isTokenValid = await this.twoFactorService.verifyTwoFactorToken(
      user.userId,
      body.token,
    );

    if (!isTokenValid) {
      throw new BadRequestException('Invalid authentication code');
    }

    return { success: true };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(
    @Body() registerDto: { email: string; password: string; fullName?: string },
  ) {
    return this.authService.register(registerDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('verify-code')
  async verifyCode(@Body() body: { email: string; code: string }) {
    return this.authService.verifyCode(body.email, body.code);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(loginDto.email, loginDto.password, response);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  async resetPassword(
    @Body() body: { email: string; code: string; newPass: string },
  ) {
    return this.authService.resetPassword(body.email, body.code, body.newPass);
  }
}
