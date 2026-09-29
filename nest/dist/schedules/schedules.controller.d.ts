import { SchedulesService } from './schedules.service';
import { GetSchedulesDto } from './dto/get-schedules.dto';
export declare class SchedulesController {
    private schedulesService;
    constructor(schedulesService: SchedulesService);
    getSchedules(query: GetSchedulesDto): {
        year: number;
        month: number;
        today: string;
        legend: any;
        schedules: any;
    };
}
