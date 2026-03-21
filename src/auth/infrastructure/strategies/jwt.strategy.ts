import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as cookie from 'cookie';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        // Prefer cookie-parser if present, otherwise parse header
        const cookies = (req as Request & { cookies?: Record<string, string> })?.cookies;
        if (cookies && cookies['access_token']) return cookies['access_token'];
        const header = req.headers?.cookie as string | undefined;
        if (!header) return null;
        try {
          const parsed = cookie.parse(header);
          return parsed['access_token'] ?? null;
        } catch {
          return null;
        }
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
