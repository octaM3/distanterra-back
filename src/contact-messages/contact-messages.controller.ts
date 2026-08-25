import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContactMessage } from '@/database/entities/contact-message.entity';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ContactMessagesService } from './contact-messages.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

// Límite estricto y propio para el formulario de contacto (independiente del límite
// global por defecto en app.module.ts), para frenar el spam de envíos repetidos.
const CONTACT_THROTTLE_LIMIT = parseInt(process.env.CONTACT_THROTTLE_LIMIT ?? '1', 10);
const CONTACT_THROTTLE_TTL_MS =
  parseInt(process.env.CONTACT_THROTTLE_TTL_SECONDS ?? '600', 10) * 1000;

@Controller()
export class ContactMessagesController {
  private readonly logger = new Logger(ContactMessagesController.name);

  constructor(private readonly contactMessagesService: ContactMessagesService) {}

  // ---- Endpoint público ----

  @Post('contact')
  @HttpCode(201)
  @Throttle({ default: { limit: CONTACT_THROTTLE_LIMIT, ttl: CONTACT_THROTTLE_TTL_MS } })
  async create(@Body() dto: CreateContactMessageDto): Promise<ContactMessage> {
    // Honeypot: campo invisible para humanos que solo un bot completaría.
    // Se responde como si el envío hubiera sido exitoso, sin persistir nada
    // ni delatar al bot que fue detectado.
    if (dto.website) {
      this.logger.warn(`POST /api/contact - honeypot activado, envío descartado (ip bot-like)`);
      return {
        id: 0,
        name: dto.name,
        company: dto.company,
        phone: dto.phone ?? null,
        email: dto.email,
        message: dto.message ?? null,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    this.logger.log(`POST /api/contact - "${dto.name}" (${dto.company})`);
    return this.contactMessagesService.create(dto);
  }

  // ---- Endpoints de administración ----

  @UseGuards(JwtAuthGuard)
  @Get('admin/contact-messages')
  async findAllForAdmin(): Promise<ContactMessage[]> {
    this.logger.debug('GET /api/admin/contact-messages');
    const messages = await this.contactMessagesService.findAllForAdmin();
    this.logger.debug(`Devolviendo ${messages.length} mensaje(s) de contacto`);
    return messages;
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/contact-messages/unread-count')
  async countUnread(): Promise<{ count: number }> {
    const count = await this.contactMessagesService.countUnread();
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/contact-messages/:id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number): Promise<ContactMessage> {
    this.logger.log(`PUT /api/admin/contact-messages/${id}/read`);
    return this.contactMessagesService.markAsRead(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/contact-messages/:id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/contact-messages/${id}`);
    await this.contactMessagesService.remove(id);
    return { ok: true };
  }
}
