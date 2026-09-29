import { FlightHoursService } from './flight-hours.service';
import { GetFlightHoursDto } from './dto/get-flight-hours.dto';
import { GetFlightHoursSummaryDto } from './dto/get-flight-hours-summary.dto';
export declare class FlightHoursController {
    private readonly flightHoursService;
    constructor(flightHoursService: FlightHoursService);
    getFlightHours(query: GetFlightHoursDto): {
        from: string;
        to: string;
        days: any[];
    };
    getSummary(query: GetFlightHoursSummaryDto): {
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
