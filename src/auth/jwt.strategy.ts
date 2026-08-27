import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { AppConfig } from '@/config/configuration';
import { Admin } from '@/database/entities/admin.entity';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    configService: ConfigService<AppConfig, true>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {
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
    // La firma del JWT puede ser válida (no expiró, no fue alterado) aunque el
    // admin al que apunta ya no exista (cuenta borrada, o base de datos
    // reseteada mientras había una sesión activa en el navegador). Sin este
    // chequeo, ese caso no fallaba acá sino más abajo, con un 500 crudo de
    // Postgres por violar una FK (ej. campaigns.created_by).
    const exists = await this.adminRepository.exists({ where: { id: payload.sub } });
    if (!exists) {
      this.logger.warn(
        `Token JWT válido pero admin id=${payload.sub} ya no existe: sesión rechazada`,
      );
      throw new UnauthorizedException('Sesión inválida: iniciá sesión nuevamente.');
    }
    this.logger.debug(`Token JWT válido para sub=${payload.sub} username="${payload.username}"`);
    return payload;
  }
}
