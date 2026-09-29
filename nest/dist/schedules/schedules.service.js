"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulesService = void 0;
const common_1 = require("@nestjs/common");
const data_service_1 = require("../data/data.service");
const app_clock_service_1 = require("../common/config/app-clock.service");
let SchedulesService = class SchedulesService {
    dataService;
    appClockService;
    constructor(dataService, appClockService) {
        this.dataService = dataService;
        this.appClockService = appClockService;
    }
    getSchedules(dto) {
        const today = this.appClockService.today();
        const schedulesData = this.dataService.schedulesData;
        const legend = schedulesData?.legend || [];
        const targetPrefix = `${dto.year}-${String(dto.month).padStart(2, '0')}`;
        const schedules = (schedulesData?.schedules || [])
            .filter((entry) => entry.duty_date.startsWith(targetPrefix))
            .map((entry) => {
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
};
exports.SchedulesService = SchedulesService;
exports.SchedulesService = SchedulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_service_1.DataService,
        app_clock_service_1.AppClockService])
], SchedulesService);
//# sourceMappingURL=schedules.service.js.map