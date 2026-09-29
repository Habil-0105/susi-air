import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { AppClockService } from '../common/config/app-clock.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, AppClockService],
})
export class DocumentsModule {}
