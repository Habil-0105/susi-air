import { DataService } from '../data/data.service';
import { AppClockService } from '../common/config/app-clock.service';
export declare class PilotService {
    private dataService;
    private appClockService;
    constructor(dataService: DataService, appClockService: AppClockService);
    getMe(): {
        name: any;
        totalFlightHours: any;
        avatarUrl: string;
        today: string;
    };
}
