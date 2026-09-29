import { Controller, Get } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  getDocuments() {
    return this.documentsService.getDocuments();
  }
}
