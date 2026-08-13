import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Experience } from '@/database/entities/experience.entity';
import { ExperienceBoss } from '@/database/entities/experience-boss.entity';
import { ExperiencesController } from './experiences.controller';
import { ExperiencesService } from './experiences.service';

@Module({
  imports: [TypeOrmModule.forFeature([Experience, ExperienceBoss])],
  controllers: [ExperiencesController],
  providers: [ExperiencesService],
})
export class ExperiencesModule {}
