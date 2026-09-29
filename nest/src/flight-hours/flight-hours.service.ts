import { Injectable, BadRequestException } from '@nestjs/common';
import { DataService } from '../data/data.service';
import { AppClockService } from '../common/config/app-clock.service';
import { getUtcDateOnly, addDaysUtc, formatUtcDate } from '../common/utils/date.util';
import { GetFlightHoursDto } from './dto/get-flight-hours.dto';
import { GetFlightHoursSummaryDto } from './dto/get-flight-hours-summary.dto';

@Injectable()
export class FlightHoursService {
  constructor(
    private dataService: DataService,
    private appClockService: AppClockService,
  ) {}

  // this is a rolling sum calculation :)
  rollingWindowBluffing(dailyMap: Map<string, number>, endDate: string, windowDays: number): number {
    let sum = 0;
    const endUtc = getUtcDateOnly(endDate);
    for (let i = 0; i < windowDays; i++) {
      const d = formatUtcDate(addDaysUtc(endUtc, -i));
      sum += dailyMap.get(d) || 0;
    }
    return Math.round(sum * 100) / 100;
  }

  private buildDailyMap(): { map: Map<string, number>, datasetStart: string } {
    const map = new Map<string, number>();
    const flightHours = this.dataService.flightHoursData?.flightHours || [];
    let datasetStart = '2099-12-31';
    for (const entry of flightHours) {
      map.set(entry.date, entry.hours);
      if (entry.date < datasetStart) datasetStart = entry.date;
    }
    return { map, datasetStart };
  }

  getFlightHours(dto: GetFlightHoursDto) {
    if (dto.from > dto.to) {
      throw new BadRequestException('from cannot be after to');
    }
    
    const { map } = this.buildDailyMap();
    const days: any[] = [];
    const fromDate = getUtcDateOnly(dto.from);
    const toDate = getUtcDateOnly(dto.to);
    const maxDays = 400;

    let currentDate = fromDate;
    let count = 0;
    while (currentDate <= toDate && count < maxDays) {
      const dStr = formatUtcDate(currentDate);
      days.push({
        date: dStr,
        hours: map.get(dStr) || 0,
      });
      currentDate = addDaysUtc(currentDate, 1);
      count++;
    }

    return {
      from: dto.from,
      to: dto.to,
      days,
    };
  }

  getSummary(dto: GetFlightHoursSummaryDto) {
    const range = dto.range || '1w';
    const todayStr = this.appClockService.today();
    const bounds = this.dataService.flightHoursData?.chartBounds?.[range];
    
    if (!bounds) {
      throw new BadRequestException('Invalid range');
    }

    const { map, datasetStart } = this.buildDailyMap();
    const points: any[] = [];
    
    const displayRangeDays = bounds.displayRangeDays || 7;
    const todayDate = getUtcDateOnly(todayStr);

    for (let i = -displayRangeDays; i <= displayRangeDays; i++) {
      const dDate = addDaysUtc(todayDate, i);
      const dStr = formatUtcDate(dDate);
      
      const hours = map.get(dStr) || 0;
      const rollingSum = this.rollingWindowBluffing(map, dStr, bounds.windowDays);
      
      const windowStartStr = formatUtcDate(addDaysUtc(dDate, -(bounds.windowDays - 1)));
      const partialWindow = windowStartStr < datasetStart;
      const isFuture = dStr > todayStr;
      
      points.push({
        date: dStr,
        hours,
        rollingSum,
        isToday: i === 0,
        isFuture,
        partialWindow,
      });
    }

    return {
      range,
      today: todayStr,
      windowDays: bounds.windowDays,
      limit: bounds.limit,
      yMax: bounds.max,
      points,
    };
  }

  getLimits() {
    const todayStr = this.appClockService.today();
    const limits = this.dataService.flightHoursData?.limits || { daily: 8, weekly: 40, monthly: 100, annual: 1050 };
    const { map } = this.buildDailyMap();

    const dailyHours = this.rollingWindowBluffing(map, todayStr, 1);
    const weeklyHours = this.rollingWindowBluffing(map, todayStr, 7);
    const monthlyHours = this.rollingWindowBluffing(map, todayStr, 30);
    const annualHours = this.rollingWindowBluffing(map, todayStr, 365);

    const getStatus = (hours: number, limit: number) => {
      const pct = (hours / limit) * 100;
      if (pct < 80) return 'safe';
      if (pct <= 100) return 'soon';
      return 'exceeded';
    };

    return {
      today: todayStr,
      cards: [
        {
          key: 'daily',
          label: 'Daily',
          hours: dailyHours,
          limit: limits.daily,
          windowDays: 1,
          percent: Math.round((dailyHours / limits.daily) * 10000) / 100,
          status: getStatus(dailyHours, limits.daily),
        },
        {
          key: 'weekly',
          label: 'Weekly',
          hours: weeklyHours,
          limit: limits.weekly,
          windowDays: 7,
          percent: Math.round((weeklyHours / limits.weekly) * 10000) / 100,
          status: getStatus(weeklyHours, limits.weekly),
        },
        {
          key: 'monthly',
          label: 'Monthly',
          hours: monthlyHours,
          limit: limits.monthly,
          windowDays: 30,
          percent: Math.round((monthlyHours / limits.monthly) * 10000) / 100,
          status: getStatus(monthlyHours, limits.monthly),
        },
        {
          key: 'annual',
          label: 'Annual',
          hours: annualHours,
          limit: limits.annual,
          windowDays: 365,
          percent: Math.round((annualHours / limits.annual) * 10000) / 100,
          status: getStatus(annualHours, limits.annual),
        }
      ]
    };
  }
}
