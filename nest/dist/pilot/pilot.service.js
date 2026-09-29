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
exports.PilotService = void 0;
const common_1 = require("@nestjs/common");
const data_service_1 = require("../data/data.service");
const app_clock_service_1 = require("../common/config/app-clock.service");
let PilotService = class PilotService {
    dataService;
    appClockService;
    constructor(dataService, appClockService) {
        this.dataService = dataService;
        this.appClockService = appClockService;
    }
    getMe() {
        const pilotData = this.dataService.flightHoursData?.pilot || {};
        return {
            name: pilotData.name || 'John Doe',
            totalFlightHours: pilotData.totalFlightHours || 1444.5,
            avatarUrl: 'https://i.pravatar.cc/150?u=johndoe',
            today: this.appClockService.today(),
        };
    }
};
exports.PilotService = PilotService;
exports.PilotService = PilotService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_service_1.DataService,
        app_clock_service_1.AppClockService])
], PilotService);
//# sourceMappingURL=pilot.service.js.map