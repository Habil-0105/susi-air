import { Test, TestingModule } from '@nestjs/testing';
import { FlightHoursService } from './flight-hours.service';
import { DataService } from '../data/data.service';
import { AppClockService } from '../common/config/app-clock.service';
import * as fs from 'fs';
import * as path from 'path';

describe('FlightHoursService', () => {
  let service: FlightHoursService;

  beforeEach(async () => {
    const dataDir = path.join(process.cwd(), 'data');
    let mockData = {};
    try {
      mockData = JSON.parse(fs.readFileSync(path.join(dataDir, 'mock-flight-hours.json'), 'utf8'));
    } catch (e) {
      // Mock data in case test is run without data folder
      mockData = {
        flightHours: [
          { date: '2024-12-27', hours: 5.7 }
        ]
      };
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightHoursService,
        {
          provide: DataService,
          useValue: { flightHoursData: mockData },
        },
        {
          provide: AppClockService,
          useValue: { today: () => '2026-05-15' },
        },
      ],
    }).compile();

    service = module.get<FlightHoursService>(FlightHoursService);
  });

  it('should calculate rollingWindowBluffing properly (rounding, missing dates = 0)', () => {
    const map = new Map<string, number>();
    map.set('2026-05-15', 6.4);
    map.set('2026-05-14', 6.7);
    // 13th is missing -> 0
    map.set('2026-05-12', 4.6);

    // 7 days ending 15th
    const sum = service.rollingWindowBluffing(map, '2026-05-15', 7);
    // 6.4 + 6.7 + 0 + 4.6 = 17.7
    expect(sum).toBe(17.7);
  });

  it('should return 15 points with index 7 as today for getSummary', () => {
    const summary = service.getSummary({ range: '1w' });
    expect(summary.points.length).toBe(15);
    expect(summary.points[7].isToday).toBe(true);
    expect(summary.points[7].date).toBe('2026-05-15');
  });

  it('should flag partialWindow correctly', () => {
    // 2024-12-27 is the start date in the real dataset
    const summary = service.getSummary({ range: '1y' });
    // Any date before 2025-12-26 for a 365-day window will be a partial window
    // 2026-05-15 - 365 is 2025-05-15, which is after 2024-12-27, so today's partial window is false
    expect(summary.points[7].partialWindow).toBe(false);
  });

  it('should identify future dates correctly', () => {
    const summary = service.getSummary({ range: '1w' });
    expect(summary.points[6].isFuture).toBe(false);
    expect(summary.points[7].isFuture).toBe(false); // today
    expect(summary.points[8].isFuture).toBe(true);  // tomorrow
  });

  it('should fill missing days with 0 in getFlightHours', () => {
    const res = service.getFlightHours({ from: '2020-01-01', to: '2020-01-03' });
    expect(res.days.length).toBe(3);
    expect(res.days[0].hours).toBe(0);
  });
});
