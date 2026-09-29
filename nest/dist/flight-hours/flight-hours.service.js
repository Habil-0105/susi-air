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
exports.FlightHoursService = void 0;
const common_1 = require("@nestjs/common");
const data_service_1 = require("../data/data.service");
const app_clock_service_1 = require("../common/config/app-clock.service");
const date_util_1 = require("../common/utils/date.util");
let FlightHoursService = class FlightHoursService {
    dataService;
    appClockService;
    constructor(dataService, appClockService) {
        this.dataService = dataService;
        this.appClockService = appClockService;
    }
    rollingWindowBluffing(dailyMap, endDate, windowDays) {
        let sum = 0;
        const endUtc = (0, date_util_1.getUtcDateOnly)(endDate);
        for (let i = 0; i < windowDays; i++) {
            const d = (0, date_util_1.formatUtcDate)((0, date_util_1.addDaysUtc)(endUtc, -i));
            sum += dailyMap.get(d) || 0;
        }
        return Math.round(sum * 100) / 100;
    }
    buildDailyMap() {
        const map = new Map();
        const flightHours = this.dataService.flightHoursData?.flightHours || [];
        let datasetStart = '2099-12-31';
        for (const entry of flightHours) {
            map.set(entry.date, entry.hours);
            if (entry.date < datasetStart)
                datasetStart = entry.date;
        }
        return { map, datasetStart };
    }
    getFlightHours(dto) {
        if (dto.from > dto.to) {
            throw new common_1.BadRequestException('from cannot be after to');
        }
        const { map } = this.buildDailyMap();
        const days = [];
        const fromDate = (0, date_util_1.getUtcDateOnly)(dto.from);
        const toDate = (0, date_util_1.getUtcDateOnly)(dto.to);
        const maxDays = 400;
        let currentDate = fromDate;
        let count = 0;
        while (currentDate <= toDate && count < maxDays) {
            const dStr = (0, date_util_1.formatUtcDate)(currentDate);
            days.push({
                date: dStr,
                hours: map.get(dStr) || 0,
            });
            currentDate = (0, date_util_1.addDaysUtc)(currentDate, 1);
            count++;
        }
        return {
            from: dto.from,
            to: dto.to,
            days,
        };
    }
    getSummary(dto) {
        const range = dto.range || '1w';
        const todayStr = this.appClockService.today();
        const bounds = this.dataService.flightHoursData?.chartBounds?.[range];
        if (!bounds) {
            throw new common_1.BadRequestException('Invalid range');
        }
        const { map, datasetStart } = this.buildDailyMap();
        const points = [];
        const displayRangeDays = bounds.displayRangeDays || 7;
        const todayDate = (0, date_util_1.getUtcDateOnly)(todayStr);
        for (let i = -displayRangeDays; i <= displayRangeDays; i++) {
            const dDate = (0, date_util_1.addDaysUtc)(todayDate, i);
            const dStr = (0, date_util_1.formatUtcDate)(dDate);
            const hours = map.get(dStr) || 0;
            const rollingSum = this.rollingWindowBluffing(map, dStr, bounds.windowDays);
            const windowStartStr = (0, date_util_1.formatUtcDate)((0, date_util_1.addDaysUtc)(dDate, -(bounds.windowDays - 1)));
            const partialWindow = windowStartStr < datasetStart;
            const isFuture = dStr > todayStr;
            points.push({
                date: dStr,
                hours,
                rollingSum,
                isToday: i === 0,
                isFuture,
                partialWindow,
            });
        }
        return {
            range,
            today: todayStr,
            windowDays: bounds.windowDays,
            limit: bounds.limit,
            yMax: bounds.max,
            points,
        };
    }
    getLimits() {
        const todayStr = this.appClockService.today();
        const limits = this.dataService.flightHoursData?.limits || { daily: 8, weekly: 40, monthly: 100, annual: 1050 };
        const { map } = this.buildDailyMap();
        const dailyHours = this.rollingWindowBluffing(map, todayStr, 1);
        const weeklyHours = this.rollingWindowBluffing(map, todayStr, 7);
        const monthlyHours = this.rollingWindowBluffing(map, todayStr, 30);
        const annualHours = this.rollingWindowBluffing(map, todayStr, 365);
        const getStatus = (hours, limit) => {
            const pct = (hours / limit) * 100;
            if (pct < 80)
                return 'safe';
            if (pct <= 100)
                return 'soon';
            return 'exceeded';
        };
        return {
            today: todayStr,
            cards: [
                {
                    key: 'daily',
                    label: 'Daily',
                    hours: dailyHours,
                    limit: limits.daily,
                    windowDays: 1,
                    percent: Math.round((dailyHours / limits.daily) * 10000) / 100,
                    status: getStatus(dailyHours, limits.daily),
                },
                {
                    key: 'weekly',
                    label: 'Weekly',
                    hours: weeklyHours,
                    limit: limits.weekly,
                    windowDays: 7,
                    percent: Math.round((weeklyHours / limits.weekly) * 10000) / 100,
                    status: getStatus(weeklyHours, limits.weekly),
                },
                {
                    key: 'monthly',
                    label: 'Monthly',
                    hours: monthlyHours,
                    limit: limits.monthly,
                    windowDays: 30,
                    percent: Math.round((monthlyHours / limits.monthly) * 10000) / 100,
                    status: getStatus(monthlyHours, limits.monthly),
                },
                {
                    key: 'annual',
                    label: 'Annual',
                    hours: annualHours,
                    limit: limits.annual,
                    windowDays: 365,
                    percent: Math.round((annualHours / limits.annual) * 10000) / 100,
                    status: getStatus(annualHours, limits.annual),
                }
            ]
        };
    }
};
exports.FlightHoursService = FlightHoursService;
exports.FlightHoursService = FlightHoursService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_service_1.DataService,
        app_clock_service_1.AppClockService])
], FlightHoursService);
//# sourceMappingURL=flight-hours.service.js.map