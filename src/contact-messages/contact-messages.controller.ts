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
import { ContactMessage } from '@/database/entities/contact-message.entity';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ContactMessagesService } from './contact-messages.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Controller()
export class ContactMessagesController {
  private readonly logger = new Logger(ContactMessagesController.name);

  constructor(private readonly contactMessagesService: ContactMessagesService) {}

  // ---- Endpoint público ----

  @Post('contact')
  @HttpCode(201)
  async create(@Body() dto: CreateContactMessageDto): Promise<ContactMessage> {
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
