import { DataService } from '../data/data.service';
import { AppClockService } from '../common/config/app-clock.service';
import { GetSchedulesDto } from './dto/get-schedules.dto';
export declare class SchedulesService {
    private dataService;
    private appClockService;
    constructor(dataService: DataService, appClockService: AppClockService);
    getSchedules(dto: GetSchedulesDto): {
        year: number;
        month: number;
        today: string;
        legend: any;
        schedules: any;
    };
}
