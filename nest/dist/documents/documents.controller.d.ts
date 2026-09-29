import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private documentsService;
    constructor(documentsService: DocumentsService);
    getDocuments(): {
        today: string;
        warningDays: any;
        documents: any;
    };
}
