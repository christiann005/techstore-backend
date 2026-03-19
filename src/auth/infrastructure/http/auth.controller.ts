import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @Post('verify-code')
  async verifyCode(@Body() body: { email: string; code: string }) {
    return this.authService.verifyCode(body.email, body.code);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: any) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; code: string; newPass: string }) {
    return this.authService.resetPassword(body.email, body.code, body.newPass);
  }
}
