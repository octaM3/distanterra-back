import { Module } from '@nestjs/common';
import { PrivateFilesController } from './private-files.controller';

@Module({
  controllers: [PrivateFilesController],
})
export class FilesModule {}
