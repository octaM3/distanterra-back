import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AppConfig } from '@/config/configuration';
import { AuthService } from './auth.service';
import { CurrentAdmin } from './current-admin.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPayload } from './jwt-payload.interface';

// El endpoint de login del administrador NO está expuesto en una ruta predecible
// como "/auth/login". Su ruta real se lee de la variable de entorno ADMIN_LOGIN_PATH
// (ver .env.example) para que no pueda descubrirse adivinando rutas comunes.
// No existe ningún enlace a esta ruta en el frontend público.
const ADMIN_LOGIN_PATH = process.env.ADMIN_LOGIN_PATH ?? '/gestion-x9k2/acceso';

// Límite estricto y propio para el login (independiente del límite global por defecto
// en app.module.ts), para frenar intentos de fuerza bruta sobre la contraseña.
const LOGIN_THROTTLE_LIMIT = parseInt(process.env.LOGIN_THROTTLE_LIMIT ?? '5', 10);
const LOGIN_THROTTLE_TTL_MS = parseInt(process.env.LOGIN_THROTTLE_TTL_SECONDS ?? '60', 10) * 1000;

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  @Post(ADMIN_LOGIN_PATH)
  @HttpCode(200)
  @Throttle({ default: { limit: LOGIN_THROTTLE_LIMIT, ttl: LOGIN_THROTTLE_TTL_MS } })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ username: string }> {
    const ip = req.ip ?? 'IP desconocida';
    this.logger.log(`Intento de login para usuario "${loginDto.username}" desde ${ip}`);

    const admin = await this.authService.validateAdmin(loginDto.username, loginDto.password);
    const token = this.authService.signToken(admin);

    res.cookie(this.configService.get('jwt.cookieName', { infer: true }), token, {
      httpOnly: true,
      secure: this.configService.get('nodeEnv', { infer: true }) === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hora, espeja JWT_EXPIRES_IN
      path: '/',
    });

    this.logger.log(`Login exitoso para administrador "${admin.username}" (id=${admin.id})`);
    return { username: admin.username };
  }

  @Post('admin/logout')
  @HttpCode(200)
  logout(
    @CurrentAdmin() admin: JwtPayload | undefined,
    @Res({ passthrough: true }) res: Response,
  ): { ok: true } {
    res.clearCookie(this.configService.get('jwt.cookieName', { infer: true }), {
      path: '/',
    });
    this.logger.log(`Cierre de sesión para administrador "${admin?.username ?? 'desconocido'}"`);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/me')
  me(@CurrentAdmin() admin: JwtPayload): JwtPayload {
    this.logger.debug(`Verificación de sesión activa para "${admin.username}"`);
    return admin;
  }
}
