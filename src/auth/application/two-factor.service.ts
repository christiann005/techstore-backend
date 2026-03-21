import { Injectable, BadRequestException } from '@nestjs/common';
import { generateSecret, generateURI, verify } from 'otplib';
import { toDataURL } from 'qrcode';
import { UsersService } from '../../users/application/users.service';

@Injectable()
export class TwoFactorService {
  constructor(private readonly usersService: UsersService) {}

  async generateSecret(userId: string, email: string) {
    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: 'TechStore Pro',
      label: email,
      secret,
    });

    // Guardar secret temporalmente en el usuario (deshabilitado hasta verificar)
    await this.usersService.update(userId, { twoFactorSecret: secret });

    const qrCodeDataURL = await toDataURL(otpauthUrl);
    return {
      secret,
      qrCodeDataURL,
    };
  }

  async verifyTwoFactorToken(userId: string, token: string) {
    const user = await this.usersService.findByIdWithSecrets(userId);
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('MFA not initiated for this user');
    }

    const { valid } = await verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (valid) {
      // Activar definitivamente el 2FA
      await this.usersService.update(userId, { isTwoFactorEnabled: true });
      return true;
    }

    return false;
  }
}
