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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const data_service_1 = require("../data/data.service");
const app_clock_service_1 = require("../common/config/app-clock.service");
const date_util_1 = require("../common/utils/date.util");
let DocumentsService = class DocumentsService {
    dataService;
    appClockService;
    constructor(dataService, appClockService) {
        this.dataService = dataService;
        this.appClockService = appClockService;
    }
    getDocuments() {
        const todayStr = this.appClockService.today();
        const todayDate = (0, date_util_1.getUtcDateOnly)(todayStr);
        const docsData = this.dataService.documentsData;
        const warningDays = docsData?.thresholds?.warningDays || 30;
        const documents = (docsData?.documents || []).map((doc) => {
            const expiryDate = (0, date_util_1.getUtcDateOnly)(doc.expiryDate);
            const daysRemaining = (0, date_util_1.diffDaysUtc)(todayDate, expiryDate);
            let status = 'safe';
            if (daysRemaining <= 0) {
                status = 'expired';
            }
            else if (daysRemaining <= warningDays) {
                status = 'soon';
            }
            return {
                id: doc.id,
                label: doc.label,
                expiryDate: doc.expiryDate,
                daysRemaining,
                status,
            };
        });
        return {
            today: todayStr,
            warningDays,
            documents,
        };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_service_1.DataService,
        app_clock_service_1.AppClockService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map