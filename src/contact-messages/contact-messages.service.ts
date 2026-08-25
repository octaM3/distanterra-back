import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from '@/config/configuration';
import { ContactMessage } from '@/database/entities/contact-message.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactMessagesService {
  private readonly logger = new Logger(ContactMessagesService.name);

  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactMessageRepository: Repository<ContactMessage>,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  /** Bloquea un segundo envío del mismo email antes de que pase el cooldown configurado. */
  private async assertEmailCooldownElapsed(email: string): Promise<void> {
    const cooldownHours = this.configService.get('contact.emailCooldownHours', { infer: true });
    const lastMessage = await this.contactMessageRepository
      .createQueryBuilder('cm')
      .where('LOWER(cm.email) = LOWER(:email)', { email })
      .orderBy('cm.created_at', 'DESC')
      .getOne();

    if (!lastMessage) return;

    const elapsedMs = Date.now() - lastMessage.createdAt.getTime();
    const cooldownMs = cooldownHours * 60 * 60 * 1000;
    if (elapsedMs < cooldownMs) {
      const remainingHours = Math.ceil((cooldownMs - elapsedMs) / (60 * 60 * 1000));
      this.logger.warn(`Envío rechazado por cooldown: "${email}" debe esperar ${remainingHours}h más`);
      throw new HttpException(
        `Ya recibimos un mensaje de este email hace menos de ${cooldownHours}h. Volvé a intentarlo en ${remainingHours}h.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /** Admin: todos los mensajes, los más recientes primero. */
  findAllForAdmin(): Promise<ContactMessage[]> {
    this.logger.debug('Obteniendo todos los mensajes de contacto para panel de administración');
    return this.contactMessageRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /** Admin: cantidad de mensajes sin leer, para el badge del panel. */
  countUnread(): Promise<number> {
    this.logger.debug('Contando mensajes de contacto sin leer');
    return this.contactMessageRepository.count({ where: { isRead: false } });
  }

  async findOneOrFail(id: number): Promise<ContactMessage> {
    const message = await this.contactMessageRepository.findOne({ where: { id } });
    if (!message) {
      this.logger.warn(`Mensaje de contacto con id=${id} no encontrado`);
      throw new NotFoundException(`Mensaje de contacto ${id} no encontrado`);
    }
    return message;
  }

  async create(dto: CreateContactMessageDto): Promise<ContactMessage> {
    await this.assertEmailCooldownElapsed(dto.email);

    this.logger.log(`Creando mensaje de contacto de "${dto.name}" (${dto.email})`);
    const message = this.contactMessageRepository.create({
      name: dto.name,
      company: dto.company,
      phone: dto.phone ?? null,
      email: dto.email,
      message: dto.message ?? null,
    });
    const saved = await this.contactMessageRepository.save(message);
    this.logger.log(`Mensaje de contacto creado con id=${saved.id}`);
    return saved;
  }

  async markAsRead(id: number): Promise<ContactMessage> {
    this.logger.log(`Marcando mensaje de contacto id=${id} como leído`);
    const message = await this.findOneOrFail(id);
    if (!message.isRead) {
      message.isRead = true;
      await this.contactMessageRepository.save(message);
    }
    return message;
  }

  /** Sin borrado lógico: los mensajes se eliminan físicamente al descartarlos. */
  async remove(id: number): Promise<void> {
    this.logger.log(`Eliminando mensaje de contacto id=${id}`);
    const message = await this.findOneOrFail(id);
    await this.contactMessageRepository.remove(message);
    this.logger.log(`Mensaje de contacto id=${id} eliminado`);
  }
}
