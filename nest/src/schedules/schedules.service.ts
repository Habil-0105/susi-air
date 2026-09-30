import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';
import { AppClockService } from '../common/config/app-clock.service';
import { GetSchedulesDto } from './dto/get-schedules.dto';

@Injectable()
export class SchedulesService {
  constructor(
    private dataService: DataService,
    private appClockService: AppClockService,
  ) {}

  getSchedules(dto: GetSchedulesDto) {
    const today = this.appClockService.today();
    const schedulesData = this.dataService.schedulesData;
    const legend = schedulesData?.legend || [];
    
    const targetPrefix = `${dto.year}-${String(dto.month).padStart(2, '0')}`;

    const schedules = (schedulesData?.schedules || [])
      .filter((entry: any) => entry.duty_date.startsWith(targetPrefix))
      .map((entry: any) => {
        const remaining = Math.max(0, (entry.count_schedules || 0) - (entry.count_logbooks || 0));
        return {
          ...entry,
          remaining,
        };
      });

    return {
      year: dto.year,
      month: dto.month,
      today,
      legend,
      schedules,
    };
  }
}
