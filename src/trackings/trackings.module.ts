import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tracking } from '@/database/entities/tracking.entity';
import { TrackingsController } from './trackings.controller';
import { TrackingsService } from './trackings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tracking])],
  controllers: [TrackingsController],
  providers: [TrackingsService],
})
export class TrackingsModule {}
