"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PilotModule = void 0;
const common_1 = require("@nestjs/common");
const pilot_controller_1 = require("./pilot.controller");
const pilot_service_1 = require("./pilot.service");
const app_clock_service_1 = require("../common/config/app-clock.service");
let PilotModule = class PilotModule {
};
exports.PilotModule = PilotModule;
exports.PilotModule = PilotModule = __decorate([
    (0, common_1.Module)({
        controllers: [pilot_controller_1.PilotController],
        providers: [pilot_service_1.PilotService, app_clock_service_1.AppClockService],
    })
], PilotModule);
//# sourceMappingURL=pilot.module.js.map