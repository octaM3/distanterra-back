import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Admin } from '@/database/entities/admin.entity';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async validateAdmin(username: string, password: string): Promise<Admin> {
    this.logger.debug(`Buscando administrador en la base de datos: "${username}"`);

    const admin = await this.adminRepository
      .createQueryBuilder('admin')
      .addSelect('admin.passwordHash')
      .where('admin.username = :username', { username })
      .getOne();

    // Siempre se ejecuta bcrypt.compare aunque el administrador no exista, usando
    // un hash de relleno, para que el tiempo de respuesta no revele si el usuario existe.
    const hashToCompare =
      admin?.passwordHash ?? '$2b$12$AbCdEfGhIjKlMnOpQrStUuVwXyZ0123456789abcdefghijklmno';
    const isValid = await bcrypt.compare(password, hashToCompare);

    if (!admin || !isValid) {
      this.logger.warn(`Intento de login fallido para usuario "${username}"`);
      throw new UnauthorizedException('Credenciales invalidas');
    }

    this.logger.debug(`Contraseña validada correctamente para "${username}"`);
    return admin;
  }

  signToken(admin: Admin): string {
    const payload: JwtPayload = { sub: admin.id, username: admin.username };
    this.logger.debug(`JWT generado para administrador "${admin.username}" (id=${admin.id})`);
    return this.jwtService.sign(payload);
  }

  // Solo permite que un administrador cambie SU PROPIA contraseña: el id sale del
  // JWT de la sesión activa (CurrentAdmin), nunca de un parámetro provisto por el cliente.
  async changePassword(
    adminId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const admin = await this.adminRepository
      .createQueryBuilder('admin')
      .addSelect('admin.passwordHash')
      .where('admin.id = :id', { id: adminId })
      .getOne();

    if (!admin) {
      throw new UnauthorizedException('Sesión inválida');
    }

    const isValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isValid) {
      this.logger.warn(`Cambio de contraseña rechazado para "${admin.username}": contraseña actual incorrecta`);
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    admin.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.adminRepository.save(admin);
    this.logger.log(`Contraseña actualizada para administrador "${admin.username}" (id=${admin.id})`);
  }
}
