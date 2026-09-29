import { PilotService } from './pilot.service';
export declare class PilotController {
    private pilotService;
    constructor(pilotService: PilotService);
    getMe(): {
        name: any;
        totalFlightHours: any;
        avatarUrl: string;
        today: string;
    };
}
