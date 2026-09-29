import { DataService } from '../data/data.service';
import { AppClockService } from '../common/config/app-clock.service';
import { GetFlightHoursDto } from './dto/get-flight-hours.dto';
import { GetFlightHoursSummaryDto } from './dto/get-flight-hours-summary.dto';
export declare class FlightHoursService {
    private dataService;
    private appClockService;
    constructor(dataService: DataService, appClockService: AppClockService);
    rollingWindowBluffing(dailyMap: Map<string, number>, endDate: string, windowDays: number): number;
    private buildDailyMap;
    getFlightHours(dto: GetFlightHoursDto): {
        from: string;
        to: string;
        days: any[];
    };
    getSummary(dto: GetFlightHoursSummaryDto): {
        range: string;
        today: string;
        windowDays: any;
        limit: any;
        yMax: any;
        points: any[];
    };
    getLimits(): {
        today: string;
        cards: {
            key: string;
            label: string;
            hours: number;
            limit: any;
            windowDays: number;
            percent: number;
            status: string;
        }[];
    };
}
