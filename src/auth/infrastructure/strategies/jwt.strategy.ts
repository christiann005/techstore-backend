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
        // Prefer cookie-parser if present, otherwise parse header
        const cookies = (req as Request & { cookies?: Record<string, string> })
          ?.cookies;
        if (cookies && typeof cookies['access_token'] === 'string')
          return cookies['access_token'];
        const header = req.headers?.cookie;
        if (!header) return null;
        // Simple cookie parser without external dependency to keep types strict
        const parsed = header
          .split(';')
          .map((p) => p.trim())
          .reduce(
            (acc: Record<string, string>, part) => {
              const idx = part.indexOf('=');
              if (idx === -1) return acc;
              const key = part.substring(0, idx).trim();
              const val = decodeURIComponent(part.substring(idx + 1));
              acc[key] = val;
              return acc;
            },
            {} as Record<string, string>,
          );
        return parsed['access_token'] ?? null;
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
