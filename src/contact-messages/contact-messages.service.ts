import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from '@/database/entities/contact-message.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactMessagesService {
  private readonly logger = new Logger(ContactMessagesService.name);

  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactMessageRepository: Repository<ContactMessage>,
  ) {}

  /** Admin: todos los mensajes, los más recientes primero. */
  findAllForAdmin(): Promise<ContactMessage[]> {
    this.logger.debug('Obteniendo todos los mensajes de contacto para panel de administración');
    return this.contactMessageRepository.find({
      order: { createdAt: 'DESC' },
    });
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
