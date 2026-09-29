import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DataService implements OnModuleInit {
  private readonly logger = new Logger(DataService.name);

  public flightHoursData: any;
  public documentsData: any;
  public schedulesData: any;

  onModuleInit() {
    const dataDir = path.join(process.cwd(), 'data');
    
    try {
      this.flightHoursData = JSON.parse(fs.readFileSync(path.join(dataDir, 'mock-flight-hours.json'), 'utf8'));
      this.documentsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'mock-documents.json'), 'utf8'));
      this.schedulesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'mock-schedules.json'), 'utf8'));

      const numDays = this.flightHoursData?.flightHours?.length || 0;
      this.logger.log(`loaded ${numDays} flight-hour days`);
    } catch (e) {
      this.logger.error('Failed to load JSON data files', e);
    }
  }
}
