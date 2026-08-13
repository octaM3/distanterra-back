import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '@/database/entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  /** Público: solo comentarios activos y no eliminados, ordenados para visualización. */
  findPublic(): Promise<Comment[]> {
    this.logger.debug('Obteniendo comentarios activos para vista pública');
    return this.commentRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /** Admin: todos los comentarios no eliminados sin importar el flag de activo. */
  findAllForAdmin(): Promise<Comment[]> {
    this.logger.debug('Obteniendo todos los comentarios para panel de administración');
    return this.commentRepository.find({
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOneOrFail(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      this.logger.warn(`Comentario con id=${id} no encontrado`);
      throw new NotFoundException(`Comentario ${id} no encontrado`);
    }
    return comment;
  }

  async create(dto: CreateCommentDto, photoUrl: string | null): Promise<Comment> {
    this.logger.log(`Creando comentario para cliente "${dto.clientName}"`);
    const comment = this.commentRepository.create({
      clientName: dto.clientName,
      commentEs: dto.commentEs,
      commentEn: dto.commentEn,
      displayOrder: dto.displayOrder ?? 0,
      isActive: dto.isActive ?? true,
      photoUrl,
    });
    const saved = await this.commentRepository.save(comment);
    this.logger.log(`Comentario creado con id=${saved.id}`);
    return saved;
  }

  async update(
    id: number,
    dto: UpdateCommentDto,
    photoUrl: string | null | undefined,
  ): Promise<Comment> {
    this.logger.log(`Actualizando comentario id=${id}`);
    const comment = await this.findOneOrFail(id);

    if (dto.clientName !== undefined) comment.clientName = dto.clientName;
    if (dto.commentEs !== undefined) comment.commentEs = dto.commentEs;
    if (dto.commentEn !== undefined) comment.commentEn = dto.commentEn;
    if (dto.displayOrder !== undefined) comment.displayOrder = dto.displayOrder;
    if (dto.isActive !== undefined) comment.isActive = dto.isActive;
    if (photoUrl !== undefined && photoUrl !== null) comment.photoUrl = photoUrl;

    const saved = await this.commentRepository.save(comment);
    this.logger.log(`Comentario id=${id} actualizado correctamente`);
    return saved;
  }

  /** Borrado lógico: establece deleted_at, la fila se conserva para auditoría. */
  async softRemove(id: number): Promise<void> {
    this.logger.log(`Borrado lógico de comentario id=${id}`);
    const comment = await this.findOneOrFail(id);
    await this.commentRepository.softRemove(comment);
    this.logger.log(`Comentario id=${id} marcado como eliminado`);
  }
}
