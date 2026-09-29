import { DataService } from '../data/data.service';
import { AppClockService } from '../common/config/app-clock.service';
export declare class DocumentsService {
    private dataService;
    private appClockService;
    constructor(dataService: DataService, appClockService: AppClockService);
    getDocuments(): {
        today: string;
        warningDays: any;
        documents: any;
    };
}
