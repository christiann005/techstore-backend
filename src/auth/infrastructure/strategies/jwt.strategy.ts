import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        const cookies = (req as Request & { cookies?: Record<string, string> })?.cookies;
        return cookies?.['access_token'] ?? null;
      },
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'defaultSecret',
    });
  }

  validate(payload: unknown): { userId: string; email: string; role: string } {
    const p = payload as { sub?: string; email?: string; role?: string };
    return {
      userId: p.sub ?? '',
      email: p.email ?? '',
      role: p.role ?? 'user',
    };
  }
}
