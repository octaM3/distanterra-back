import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppConfig } from '@/config/configuration';
import { Comment } from '@/database/entities/comment.entity';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { buildImageMulterOptions } from '@/common/utils/file-upload.util';
import { toPublicFileUrl } from '@/common/utils/public-url.util';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

interface CommentResponse extends Omit<Comment, 'photoUrl'> {
  photoUrl: string | null;
}

@Controller()
export class CommentsController {
  private readonly logger = new Logger(CommentsController.name);

  constructor(
    private readonly commentsService: CommentsService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  /** Transforma la entidad reemplazando la ruta relativa del archivo por una URL pública completa. */
  private toResponse(comment: Comment): CommentResponse {
    const apiUrl = this.configService.get('apiUrl', { infer: true });
    return { ...comment, photoUrl: toPublicFileUrl(apiUrl, comment.photoUrl) };
  }

  // ---- Endpoints públicos ----

  @Get('comments')
  async findPublic(): Promise<CommentResponse[]> {
    this.logger.debug('GET /api/comments - vista pública');
    const comments = await this.commentsService.findPublic();
    this.logger.debug(`Devolviendo ${comments.length} comentario(s) activo(s)`);
    return comments.map((c) => this.toResponse(c));
  }

  // ---- Endpoints de administración ----

  @UseGuards(JwtAuthGuard)
  @Get('admin/comments')
  async findAllForAdmin(): Promise<CommentResponse[]> {
    this.logger.debug('GET /api/admin/comments');
    const comments = await this.commentsService.findAllForAdmin();
    this.logger.debug(`Devolviendo ${comments.length} comentario(s) totales`);
    return comments.map((c) => this.toResponse(c));
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/comments')
  @UseInterceptors(FileInterceptor('photo', buildImageMulterOptions('comments')))
  async create(
    @Body() dto: CreateCommentDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<CommentResponse> {
    this.logger.log(`POST /api/admin/comments - cliente: "${dto.clientName}", foto: ${file ? file.filename : 'ninguna'}`);
    const photoUrl = file ? `comments/${file.filename}` : null;
    const comment = await this.commentsService.create(dto, photoUrl);
    return this.toResponse(comment);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/comments/:id')
  @UseInterceptors(FileInterceptor('photo', buildImageMulterOptions('comments')))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<CommentResponse> {
    this.logger.log(`PUT /api/admin/comments/${id}${file ? ` con nueva foto: ${file.filename}` : ''}`);
    const photoUrl = file ? `comments/${file.filename}` : undefined;
    const comment = await this.commentsService.update(id, dto, photoUrl);
    return this.toResponse(comment);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/comments/:id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: true }> {
    this.logger.log(`DELETE /api/admin/comments/${id}`);
    await this.commentsService.softRemove(id);
    return { ok: true };
  }
}
