import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';
import { AppClockService } from '../common/config/app-clock.service';
import { diffDaysUtc, getUtcDateOnly } from '../common/utils/date.util';

@Injectable()
export class DocumentsService {
  constructor(
    private dataService: DataService,
    private appClockService: AppClockService,
  ) {}

  getDocuments() {
    const todayStr = this.appClockService.today();
    const todayDate = getUtcDateOnly(todayStr);
    
    const docsData = this.dataService.documentsData;
    const warningDays = docsData?.thresholds?.warningDays || 30;
    
    const documents = (docsData?.documents || []).map((doc: any) => {
      const expiryDate = getUtcDateOnly(doc.expiryDate);
      const daysRemaining = diffDaysUtc(todayDate, expiryDate);
      
      let status = 'safe';
      if (daysRemaining <= 0) {
        status = 'expired';
      } else if (daysRemaining <= warningDays) {
        status = 'soon';
      }

      return {
        id: doc.id,
        label: doc.label,
        expiryDate: doc.expiryDate,
        daysRemaining,
        status,
      };
    });

    return {
      today: todayStr,
      warningDays,
      documents,
    };
  }
}
