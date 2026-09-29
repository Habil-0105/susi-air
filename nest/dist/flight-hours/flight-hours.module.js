"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightHoursModule = void 0;
const common_1 = require("@nestjs/common");
const flight_hours_controller_1 = require("./flight-hours.controller");
const flight_hours_service_1 = require("./flight-hours.service");
const app_clock_service_1 = require("../common/config/app-clock.service");
let FlightHoursModule = class FlightHoursModule {
};
exports.FlightHoursModule = FlightHoursModule;
exports.FlightHoursModule = FlightHoursModule = __decorate([
    (0, common_1.Module)({
        controllers: [flight_hours_controller_1.FlightHoursController],
        providers: [flight_hours_service_1.FlightHoursService, app_clock_service_1.AppClockService],
    })
], FlightHoursModule);
//# sourceMappingURL=flight-hours.module.js.map