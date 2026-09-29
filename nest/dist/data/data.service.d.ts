import { OnModuleInit } from '@nestjs/common';
export declare class DataService implements OnModuleInit {
    private readonly logger;
    flightHoursData: any;
    documentsData: any;
    schedulesData: any;
    onModuleInit(): void;
}
