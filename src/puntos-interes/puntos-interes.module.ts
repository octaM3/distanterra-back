import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PuntoInteres } from '@/database/entities/punto-interes.entity';
import { PuntosInteresController } from './puntos-interes.controller';
import { PuntosInteresService } from './puntos-interes.service';

@Module({
  imports: [TypeOrmModule.forFeature([PuntoInteres])],
  controllers: [PuntosInteresController],
  providers: [PuntosInteresService],
})
export class PuntosInteresModule {}
