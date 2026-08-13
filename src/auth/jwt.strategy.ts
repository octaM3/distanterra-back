import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { AppConfig } from '@/config/configuration';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(configService: ConfigService<AppConfig, true>) {
    // El JWT se lee exclusivamente desde la cookie httpOnly, nunca del header Authorization.
    // Esto evita que el token quede expuesto a JavaScript del lado del cliente (XSS).
    const cookieName = configService.get('jwt.cookieName', { infer: true });
    super({
      jwtFromRequest: (req: Request) => {
        return req?.cookies?.[cookieName] ?? null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret', { infer: true }),
    });
    this.logger.log(`Estrategia JWT configurada. Cookie: "${cookieName}"`);
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    this.logger.debug(`Token JWT válido para sub=${payload.sub} username="${payload.username}"`);
    return payload;
  }
}
