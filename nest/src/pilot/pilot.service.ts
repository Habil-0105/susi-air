import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';
import { AppClockService } from '../common/config/app-clock.service';

@Injectable()
export class PilotService {
  constructor(
    private dataService: DataService,
    private appClockService: AppClockService,
  ) {}

  getMe() {
    const pilotData = this.dataService.flightHoursData?.pilot || {};
    return {
      name: pilotData.name || 'John Doe',
      totalFlightHours: pilotData.totalFlightHours || 1444.5,
      avatarUrl: 'https://i.pravatar.cc/150?u=johndoe',
      today: this.appClockService.today(),
    };
  }
}
