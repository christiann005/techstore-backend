import { Injectable, BadRequestException } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { UsersService } from '../../users/application/users.service';

@Injectable()
export class TwoFactorService {
  constructor(private readonly usersService: UsersService) {}

  async generateSecret(userId: string, email: string) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(email, 'TechStore Pro', secret);

    // Guardar secret temporalmente en el usuario (deshabilitado hasta verificar)
    await this.usersService.update(userId, { twoFactorSecret: secret });

    const qrCodeDataURL = await toDataURL(otpauthUrl);
    return {
      secret,
      qrCodeDataURL,
    };
  }

  async verifyTwoFactorToken(userId: string, token: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('MFA not initiated for this user');
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (isValid) {
      // Activar definitivamente el 2FA
      await this.usersService.update(userId, { isTwoFactorEnabled: true });
      return true;
    }

    return false;
  }
}
